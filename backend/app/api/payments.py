"""
Payment API endpoints for QUANTA.

Handles Stripe checkout sessions and webhooks for add-on purchases.

Cost Control: Add-ons allow orgs to purchase additional simulation runs,
circuits, or storage beyond their plan limits.
"""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User, Organization
from app.core.security import get_current_approved_user
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payments", tags=["Payments"])


# =============================================================================
# ADD-ON DEFINITIONS
# =============================================================================

# Add-on products and their effects
ADDONS = {
    "simulation_runs_100": {
        "name": "100 Extra Simulation Runs",
        "description": "Add 100 simulation runs to your monthly allowance",
        "price_cents": 500,  # $5
        "effect": {"simulation_runs_limit": 100},
    },
    "simulation_runs_500": {
        "name": "500 Extra Simulation Runs",
        "description": "Add 500 simulation runs to your monthly allowance",
        "price_cents": 2000,  # $20
        "effect": {"simulation_runs_limit": 500},
    },
    "circuits_10": {
        "name": "10 Extra Circuit Slots",
        "description": "Save 10 more circuits",
        "price_cents": 300,  # $3
        "effect": {"circuits_limit": 10},
    },
    "circuits_50": {
        "name": "50 Extra Circuit Slots",
        "description": "Save 50 more circuits",
        "price_cents": 1000,  # $10
        "effect": {"circuits_limit": 50},
    },
    "storage_100mb": {
        "name": "100MB Extra Storage",
        "description": "Add 100MB to your storage limit",
        "price_cents": 200,  # $2
        "effect": {"storage_bytes_limit": 104857600},  # 100MB
    },
}


# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class CreateCheckoutRequest(BaseModel):
    addon_id: str
    success_url: str
    cancel_url: str


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


class AddonInfo(BaseModel):
    id: str
    name: str
    description: str
    price_cents: int


# =============================================================================
# ENDPOINTS
# =============================================================================

@router.get("/addons", response_model=list[AddonInfo])
def list_addons():
    """List available add-on products."""
    return [
        AddonInfo(
            id=addon_id,
            name=addon["name"],
            description=addon["description"],
            price_cents=addon["price_cents"],
        )
        for addon_id, addon in ADDONS.items()
    ]


@router.post("/checkout", response_model=CheckoutResponse)
def create_checkout_session(
    data: CreateCheckoutRequest,
    user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db),
):
    """
    Create a Stripe checkout session for an add-on purchase.

    Returns the checkout URL to redirect the user to.
    """
    if not settings.stripe_secret_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment processing not configured"
        )

    if data.addon_id not in ADDONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown add-on: {data.addon_id}"
        )

    addon = ADDONS[data.addon_id]

    # Get or create Stripe customer
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    if not org:
        raise HTTPException(status_code=500, detail="Organization not found")

    try:
        import stripe
        stripe.api_key = settings.stripe_secret_key

        # Create or retrieve Stripe customer
        if not org.stripe_customer_id:
            customer = stripe.Customer.create(
                email=user.email,
                name=org.name or user.email,
                metadata={
                    "organization_id": str(org.id),
                    "domain": org.domain,
                },
            )
            org.stripe_customer_id = customer.id
            db.commit()

        # Create checkout session
        session = stripe.checkout.Session.create(
            customer=org.stripe_customer_id,
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "unit_amount": addon["price_cents"],
                        "product_data": {
                            "name": addon["name"],
                            "description": addon["description"],
                        },
                    },
                    "quantity": 1,
                },
            ],
            mode="payment",
            success_url=data.success_url,
            cancel_url=data.cancel_url,
            metadata={
                "organization_id": str(org.id),
                "addon_id": data.addon_id,
            },
        )

        logger.info(
            f"Checkout session created: org_id={org.id}, addon={data.addon_id}, "
            f"session_id={session.id}"
        )

        return CheckoutResponse(
            checkout_url=session.url,
            session_id=session.id,
        )

    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe library not installed"
        )
    except Exception as e:
        logger.error(f"Stripe checkout error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create checkout session"
        )


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None, alias="Stripe-Signature"),
    db: Session = Depends(get_db),
):
    """
    Handle Stripe webhook events.

    Processes checkout.session.completed to apply add-on purchases.
    """
    if not settings.stripe_secret_key or not settings.stripe_webhook_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Webhook not configured"
        )

    try:
        import stripe
        stripe.api_key = settings.stripe_secret_key

        # Get raw body for signature verification
        payload = await request.body()

        try:
            event = stripe.Webhook.construct_event(
                payload,
                stripe_signature,
                settings.stripe_webhook_secret,
            )
        except stripe.error.SignatureVerificationError as e:
            logger.warning(f"Invalid webhook signature: {e}")
            raise HTTPException(status_code=400, detail="Invalid signature")

        # Handle the event
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            _handle_checkout_completed(db, session)

        elif event["type"] == "customer.subscription.updated":
            # Handle subscription updates (future use)
            pass

        elif event["type"] == "customer.subscription.deleted":
            # Handle subscription cancellation (future use)
            pass

        return {"status": "ok"}

    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe library not installed"
        )


def _handle_checkout_completed(db: Session, session: dict) -> None:
    """
    Process a completed checkout session.

    Applies the purchased add-on to the organization.
    """
    metadata = session.get("metadata", {})
    org_id = metadata.get("organization_id")
    addon_id = metadata.get("addon_id")

    if not org_id or not addon_id:
        logger.warning(f"Checkout session missing metadata: {session.get('id')}")
        return

    org = db.query(Organization).filter(Organization.id == int(org_id)).first()
    if not org:
        logger.error(f"Organization not found for checkout: org_id={org_id}")
        return

    addon = ADDONS.get(addon_id)
    if not addon:
        logger.error(f"Unknown addon in checkout: addon_id={addon_id}")
        return

    # Apply add-on effects
    effects = addon["effect"]

    if "simulation_runs_limit" in effects:
        if org.simulation_runs_limit != -1:  # Don't modify unlimited
            org.simulation_runs_limit += effects["simulation_runs_limit"]

    if "circuits_limit" in effects:
        if org.circuits_limit != -1:
            org.circuits_limit += effects["circuits_limit"]

    if "storage_bytes_limit" in effects:
        if org.storage_bytes_limit != -1:
            org.storage_bytes_limit += effects["storage_bytes_limit"]

    db.commit()

    logger.info(
        f"Add-on applied: org_id={org_id}, addon={addon_id}, "
        f"effects={effects}"
    )


# =============================================================================
# BILLING PORTAL
# =============================================================================

@router.get("/portal")
def get_billing_portal(
    return_url: str,
    user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db),
):
    """
    Get a Stripe billing portal URL for the organization.

    Allows customers to manage their payment methods and view invoices.
    """
    if not settings.stripe_secret_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment processing not configured"
        )

    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    if not org or not org.stripe_customer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No billing account found"
        )

    try:
        import stripe
        stripe.api_key = settings.stripe_secret_key

        session = stripe.billing_portal.Session.create(
            customer=org.stripe_customer_id,
            return_url=return_url,
        )

        return {"url": session.url}

    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe library not installed"
        )
    except Exception as e:
        logger.error(f"Billing portal error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create billing portal session"
        )
