"""
Organization and user management API routes.

Handles:
- Signup (creates org + user)
- Organization info
- User management (approval, roles)
- Usage stats
"""
import logging
import secrets
from datetime import datetime, timedelta
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status, Response
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.db.database import get_db
from app.db.models import User, Organization
from app.core.security import (
    get_password_hash,
    create_access_token,
    create_refresh_token,
    set_auth_cookies,
    get_current_user_required,
    get_current_approved_user,
    require_role,
    is_axion_user,
)
from app.core.plans import get_usage_summary
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orgs", tags=["Organizations"])


# =============================================================================
# CONSTANTS
# =============================================================================

# Public email domains - each user gets their own personal org
PUBLIC_EMAIL_DOMAINS = {
    "gmail.com", "googlemail.com",
    "yahoo.com", "yahoo.co.uk", "ymail.com",
    "hotmail.com", "hotmail.co.uk", "outlook.com", "live.com", "msn.com",
    "icloud.com", "me.com", "mac.com",
    "aol.com",
    "protonmail.com", "proton.me",
    "zoho.com",
    "mail.com",
    "gmx.com", "gmx.net",
}

# Educational domain suffixes - get "education" plan
EDUCATIONAL_SUFFIXES = {
    ".edu", ".edu.au", ".edu.cn", ".edu.mx", ".edu.br",
    ".ac.uk", ".ac.jp", ".ac.nz", ".ac.za",
    ".edu.co", ".edu.ar", ".edu.pe",
}

# Trial duration for new orgs
TRIAL_DURATION_DAYS = 14


# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class SignupResponse(BaseModel):
    message: str
    email: str
    organization_id: int
    is_first_user: bool
    requires_approval: bool


class UserResponse(BaseModel):
    id: int
    email: str
    name: Optional[str]
    role: str
    is_approved: bool
    email_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class OrganizationResponse(BaseModel):
    id: int
    name: Optional[str]
    domain: str
    plan: str
    subscription_status: str
    trial_ends_at: Optional[datetime]
    is_axion: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UsageResponse(BaseModel):
    organization: OrganizationResponse
    usage: dict


# =============================================================================
# SIGNUP
# =============================================================================

def _is_public_email(domain: str) -> bool:
    """Check if domain is a public email provider."""
    return domain.lower() in PUBLIC_EMAIL_DOMAINS


def _is_educational_domain(domain: str) -> bool:
    """Check if domain is educational (e.g., .edu)."""
    return any(domain.lower().endswith(suffix) for suffix in EDUCATIONAL_SUFFIXES)


def _is_axion_domain(domain: str) -> bool:
    """Check if domain is Axion Deep Labs."""
    return domain.lower() == settings.axion_domain.lower()


def _determine_plan(domain: str, is_axion: bool) -> str:
    """Determine plan based on domain."""
    if is_axion:
        return "research"
    elif _is_educational_domain(domain):
        return "education"
    else:
        return "free"


def _get_limits_for_plan(plan: str) -> dict:
    """Get limit values for a plan."""
    return settings.get_limits_for_plan(plan)


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(
    data: SignupRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    """
    Register a new user.

    Domain-based organization assignment:
    - Public emails (gmail, etc.): Create personal org
    - Educational (.edu): Join/create educational org
    - axiondeep.com: Join Axion Deep Labs org (research plan)
    - Other domains: Join/create org for that domain

    First user in an org becomes OWNER (auto-approved).
    Subsequent users need approval.
    """
    email = data.email.lower().strip()

    # Check if user already exists
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Extract domain
    if "@" not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email address"
        )
    domain = email.split("@")[-1].lower()

    # Determine org handling
    is_public = _is_public_email(domain)
    is_axion = _is_axion_domain(domain)

    if is_public:
        # Personal org - unique pseudo-domain
        org = Organization(
            name=email.split("@")[0],  # Use email prefix as name
            domain=f"{uuid4().hex[:12]}.personal",  # Unique pseudo-domain
            api_key=secrets.token_urlsafe(32),
            plan="free",
            institution_type="individual",
            **_get_limits_for_plan("free"),
        )
        db.add(org)
        db.commit()
        db.refresh(org)
        is_first_user = True
        logger.info(f"Created personal org for {email}: org_id={org.id}")

    else:
        # Business/educational domain - check if org exists
        org = db.query(Organization).filter(Organization.domain == domain).first()

        if not org:
            # Create new org for this domain
            plan = _determine_plan(domain, is_axion)
            limits = _get_limits_for_plan(plan)

            org = Organization(
                name=domain,
                domain=domain,
                api_key=secrets.token_urlsafe(32),
                plan=plan,
                institution_type="research_lab" if is_axion else (
                    "university" if _is_educational_domain(domain) else "organization"
                ),
                **limits,
            )
            db.add(org)

            try:
                db.commit()
                logger.info(f"Created org for domain {domain}: org_id={org.id}, plan={plan}")
            except IntegrityError:
                # Race condition - org was created by another request
                db.rollback()
                org = db.query(Organization).filter(Organization.domain == domain).first()

            db.refresh(org)

        # Check if first user
        existing_users = db.query(User).filter(User.organization_id == org.id).count()
        is_first_user = existing_users == 0

    # Start trial for new orgs
    if is_first_user and org.plan != "research":
        org.trial_started_at = datetime.utcnow()
        org.trial_ends_at = datetime.utcnow() + timedelta(days=TRIAL_DURATION_DAYS)
        org.subscription_status = "trialing"
        db.commit()

    # Create user
    new_user = User(
        email=email,
        hashed_password=get_password_hash(data.password),
        name=data.name,
        organization_id=org.id,
        role="OWNER" if is_first_user else "STUDENT",
        is_approved=is_first_user,  # First user auto-approved
        is_default=is_first_user,   # First user is default
        email_verified=False,       # TODO: Email verification
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    logger.info(
        f"User created: email={email}, org_id={org.id}, "
        f"role={new_user.role}, is_first={is_first_user}"
    )

    # Set auth cookies for immediate login (convenience)
    access_token = create_access_token(new_user.email)
    refresh_token = create_refresh_token(new_user.email)
    set_auth_cookies(response, access_token, refresh_token)

    return SignupResponse(
        message="Account created successfully" if is_first_user else
                "Account created. Awaiting approval from organization administrator.",
        email=new_user.email,
        organization_id=org.id,
        is_first_user=is_first_user,
        requires_approval=not is_first_user,
    )


# =============================================================================
# ORGANIZATION INFO
# =============================================================================

@router.get("/current", response_model=UsageResponse)
def get_current_organization(
    user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    """Get current user's organization and usage stats."""
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    return UsageResponse(
        organization=OrganizationResponse(
            id=org.id,
            name=org.name,
            domain=org.domain,
            plan=org.plan,
            subscription_status=org.subscription_status,
            trial_ends_at=org.trial_ends_at,
            is_axion=settings.is_axion_org(org.id),
            created_at=org.created_at,
        ),
        usage=get_usage_summary(org),
    )


# =============================================================================
# USER MANAGEMENT
# =============================================================================

@router.get("/users", response_model=list[UserResponse])
def list_organization_users(
    user: User = Depends(require_role("OWNER", "ADMIN")),
    db: Session = Depends(get_db),
):
    """List all users in the organization (OWNER/ADMIN only)."""
    users = db.query(User).filter(
        User.organization_id == user.organization_id
    ).order_by(User.created_at.desc()).all()

    return [
        UserResponse(
            id=u.id,
            email=u.email,
            name=u.name,
            role=u.role,
            is_approved=u.is_approved,
            email_verified=u.email_verified,
            created_at=u.created_at,
        )
        for u in users
    ]


@router.get("/users/pending", response_model=list[UserResponse])
def list_pending_users(
    user: User = Depends(require_role("OWNER", "ADMIN")),
    db: Session = Depends(get_db),
):
    """List users awaiting approval (OWNER/ADMIN only)."""
    pending = db.query(User).filter(
        User.organization_id == user.organization_id,
        User.is_approved == False,
    ).order_by(User.created_at.desc()).all()

    return [
        UserResponse(
            id=u.id,
            email=u.email,
            name=u.name,
            role=u.role,
            is_approved=u.is_approved,
            email_verified=u.email_verified,
            created_at=u.created_at,
        )
        for u in pending
    ]


@router.post("/users/{user_id}/approve")
def approve_user(
    user_id: int,
    current_user: User = Depends(require_role("OWNER", "ADMIN")),
    db: Session = Depends(get_db),
):
    """Approve a pending user (OWNER/ADMIN only)."""
    target_user = db.query(User).filter(
        User.id == user_id,
        User.organization_id == current_user.organization_id,
    ).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if target_user.is_approved:
        return {"message": "User already approved", "email": target_user.email}

    target_user.is_approved = True
    db.commit()

    logger.info(f"User approved: {target_user.email} by {current_user.email}")
    return {"message": "User approved", "email": target_user.email}


@router.post("/users/{user_id}/reject")
def reject_user(
    user_id: int,
    current_user: User = Depends(require_role("OWNER", "ADMIN")),
    db: Session = Depends(get_db),
):
    """Reject and delete a pending user (OWNER/ADMIN only)."""
    target_user = db.query(User).filter(
        User.id == user_id,
        User.organization_id == current_user.organization_id,
    ).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if target_user.is_approved:
        raise HTTPException(
            status_code=400,
            detail="Cannot reject an approved user. Use remove instead."
        )

    email = target_user.email
    db.delete(target_user)
    db.commit()

    logger.info(f"User rejected: {email} by {current_user.email}")
    return {"message": "User rejected and removed", "email": email}


class RoleUpdateRequest(BaseModel):
    role: str


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    data: RoleUpdateRequest,
    current_user: User = Depends(require_role("OWNER")),
    db: Session = Depends(get_db),
):
    """Update a user's role (OWNER only)."""
    valid_roles = {"OWNER", "ADMIN", "INSTRUCTOR", "STUDENT", "RESEARCHER"}
    if data.role not in valid_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )

    target_user = db.query(User).filter(
        User.id == user_id,
        User.organization_id == current_user.organization_id,
    ).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Can't change your own role (prevents removing last owner)
    if target_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")

    old_role = target_user.role
    target_user.role = data.role
    db.commit()

    logger.info(
        f"User role changed: {target_user.email} from {old_role} to {data.role} "
        f"by {current_user.email}"
    )
    return {"message": "Role updated", "email": target_user.email, "role": data.role}


@router.delete("/users/{user_id}")
def remove_user(
    user_id: int,
    current_user: User = Depends(require_role("OWNER", "ADMIN")),
    db: Session = Depends(get_db),
):
    """Remove a user from the organization (OWNER/ADMIN only)."""
    target_user = db.query(User).filter(
        User.id == user_id,
        User.organization_id == current_user.organization_id,
    ).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Can't remove yourself
    if target_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself")

    # Can't remove owner unless you're also owner
    if target_user.role == "OWNER" and current_user.role != "OWNER":
        raise HTTPException(status_code=403, detail="Only owners can remove other owners")

    email = target_user.email
    db.delete(target_user)
    db.commit()

    logger.info(f"User removed: {email} by {current_user.email}")
    return {"message": "User removed", "email": email}
