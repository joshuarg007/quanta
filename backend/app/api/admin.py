"""
Admin API endpoints for QUANTA platform management.

These endpoints are restricted to Axion Deep Labs staff with ADMIN role.
Provides cross-organization management capabilities.

Priority: Legal Protection - audit trails for all admin actions.
"""
import logging
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.db.models import Organization, User, Circuit, Experiment, ExperimentRun
from app.core.security import get_current_approved_user, is_axion_user
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["Admin"])


# =============================================================================
# ADMIN ACCESS CONTROL
# =============================================================================

def require_platform_admin(
    user: User = Depends(get_current_approved_user),
) -> User:
    """
    Require user to be an Axion Deep Labs admin.

    Only Axion admins can manage the platform.
    """
    if not is_axion_user(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Platform admin access required"
        )
    if user.role not in ("OWNER", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required"
        )
    return user


# =============================================================================
# RESPONSE MODELS
# =============================================================================

class OrgSummary(BaseModel):
    id: int
    name: Optional[str]
    domain: str
    plan: str
    subscription_status: str
    user_count: int
    circuit_count: int
    simulation_runs_this_month: int
    simulation_runs_limit: int
    created_at: datetime


class OrgDetail(BaseModel):
    id: int
    name: Optional[str]
    domain: str
    plan: str
    subscription_status: str
    stripe_customer_id: Optional[str]

    # Usage
    simulation_runs_this_month: int
    simulation_runs_limit: int
    circuits_count: int
    circuits_limit: int
    storage_bytes_used: int
    storage_bytes_limit: int
    experiments_count: int
    experiments_limit: int
    experiment_runs_this_month: int
    experiment_runs_limit: int

    # Trial
    trial_started_at: Optional[datetime]
    trial_ends_at: Optional[datetime]

    # Meta
    institution_type: Optional[str]
    created_at: datetime
    user_count: int


class UserSummary(BaseModel):
    id: int
    email: str
    name: Optional[str]
    role: str
    is_approved: bool
    email_verified: bool
    organization_id: int
    organization_name: Optional[str]
    created_at: datetime
    last_login_at: Optional[datetime]


class PlatformStats(BaseModel):
    total_organizations: int
    total_users: int
    total_circuits: int
    total_experiments: int
    total_experiment_runs: int
    active_trials: int
    plans_breakdown: dict


class OrgUpdateRequest(BaseModel):
    name: Optional[str] = None
    plan: Optional[str] = None
    simulation_runs_limit: Optional[int] = None
    circuits_limit: Optional[int] = None
    storage_bytes_limit: Optional[int] = None
    experiments_limit: Optional[int] = None
    experiment_runs_limit: Optional[int] = None


# =============================================================================
# PLATFORM STATS
# =============================================================================

@router.get("/stats", response_model=PlatformStats)
def get_platform_stats(
    admin: User = Depends(require_platform_admin),
    db: Session = Depends(get_db),
):
    """Get platform-wide statistics."""
    logger.info(f"Admin stats accessed by {admin.email}")

    total_orgs = db.query(func.count(Organization.id)).scalar()
    total_users = db.query(func.count(User.id)).scalar()
    total_circuits = db.query(func.count(Circuit.id)).scalar()
    total_experiments = db.query(func.count(Experiment.id)).scalar()
    total_runs = db.query(func.count(ExperimentRun.id)).scalar()

    # Active trials
    now = datetime.utcnow()
    active_trials = db.query(func.count(Organization.id)).filter(
        Organization.subscription_status == "trialing",
        Organization.trial_ends_at > now,
    ).scalar()

    # Plans breakdown
    plans = db.query(
        Organization.plan,
        func.count(Organization.id)
    ).group_by(Organization.plan).all()
    plans_breakdown = {plan: count for plan, count in plans}

    return PlatformStats(
        total_organizations=total_orgs or 0,
        total_users=total_users or 0,
        total_circuits=total_circuits or 0,
        total_experiments=total_experiments or 0,
        total_experiment_runs=total_runs or 0,
        active_trials=active_trials or 0,
        plans_breakdown=plans_breakdown,
    )


# =============================================================================
# ORGANIZATION MANAGEMENT
# =============================================================================

@router.get("/organizations", response_model=List[OrgSummary])
def list_organizations(
    plan: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(default=50, le=200),
    offset: int = 0,
    admin: User = Depends(require_platform_admin),
    db: Session = Depends(get_db),
):
    """List all organizations with optional filtering."""
    logger.info(f"Admin org list accessed by {admin.email}")

    query = db.query(Organization)

    if plan:
        query = query.filter(Organization.plan == plan)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Organization.name.ilike(search_term)) |
            (Organization.domain.ilike(search_term))
        )

    orgs = query.order_by(Organization.created_at.desc()).offset(offset).limit(limit).all()

    results = []
    for org in orgs:
        user_count = db.query(func.count(User.id)).filter(User.organization_id == org.id).scalar()
        circuit_count = db.query(func.count(Circuit.id)).filter(Circuit.organization_id == org.id).scalar()

        results.append(OrgSummary(
            id=org.id,
            name=org.name,
            domain=org.domain,
            plan=org.plan,
            subscription_status=org.subscription_status,
            user_count=user_count or 0,
            circuit_count=circuit_count or 0,
            simulation_runs_this_month=org.simulation_runs_this_month,
            simulation_runs_limit=org.simulation_runs_limit,
            created_at=org.created_at,
        ))

    return results


@router.get("/organizations/{org_id}", response_model=OrgDetail)
def get_organization(
    org_id: int,
    admin: User = Depends(require_platform_admin),
    db: Session = Depends(get_db),
):
    """Get detailed organization information."""
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    user_count = db.query(func.count(User.id)).filter(User.organization_id == org.id).scalar()

    logger.info(f"Admin viewed org {org_id} ({org.domain}) - by {admin.email}")

    return OrgDetail(
        id=org.id,
        name=org.name,
        domain=org.domain,
        plan=org.plan,
        subscription_status=org.subscription_status,
        stripe_customer_id=org.stripe_customer_id,
        simulation_runs_this_month=org.simulation_runs_this_month,
        simulation_runs_limit=org.simulation_runs_limit,
        circuits_count=org.circuits_count,
        circuits_limit=org.circuits_limit,
        storage_bytes_used=org.storage_bytes_used,
        storage_bytes_limit=org.storage_bytes_limit,
        experiments_count=org.experiments_count,
        experiments_limit=org.experiments_limit,
        experiment_runs_this_month=org.experiment_runs_this_month,
        experiment_runs_limit=org.experiment_runs_limit,
        trial_started_at=org.trial_started_at,
        trial_ends_at=org.trial_ends_at,
        institution_type=org.institution_type,
        created_at=org.created_at,
        user_count=user_count or 0,
    )


@router.put("/organizations/{org_id}")
def update_organization(
    org_id: int,
    data: OrgUpdateRequest,
    admin: User = Depends(require_platform_admin),
    db: Session = Depends(get_db),
):
    """Update organization settings (plan, limits)."""
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    changes = []

    if data.name is not None:
        changes.append(f"name: {org.name} -> {data.name}")
        org.name = data.name

    if data.plan is not None:
        valid_plans = {"free", "education", "research"}
        if data.plan not in valid_plans:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid plan. Must be one of: {', '.join(valid_plans)}"
            )
        changes.append(f"plan: {org.plan} -> {data.plan}")
        org.plan = data.plan

    if data.simulation_runs_limit is not None:
        changes.append(f"simulation_runs_limit: {org.simulation_runs_limit} -> {data.simulation_runs_limit}")
        org.simulation_runs_limit = data.simulation_runs_limit

    if data.circuits_limit is not None:
        changes.append(f"circuits_limit: {org.circuits_limit} -> {data.circuits_limit}")
        org.circuits_limit = data.circuits_limit

    if data.storage_bytes_limit is not None:
        changes.append(f"storage_bytes_limit: {org.storage_bytes_limit} -> {data.storage_bytes_limit}")
        org.storage_bytes_limit = data.storage_bytes_limit

    if data.experiments_limit is not None:
        changes.append(f"experiments_limit: {org.experiments_limit} -> {data.experiments_limit}")
        org.experiments_limit = data.experiments_limit

    if data.experiment_runs_limit is not None:
        changes.append(f"experiment_runs_limit: {org.experiment_runs_limit} -> {data.experiment_runs_limit}")
        org.experiment_runs_limit = data.experiment_runs_limit

    org.updated_at = datetime.utcnow()
    db.commit()

    # Audit log
    logger.info(
        f"Admin updated org {org_id} ({org.domain}): "
        f"{', '.join(changes)} - by {admin.email}"
    )

    return {"status": "updated", "changes": changes}


@router.post("/organizations/{org_id}/reset-usage")
def reset_organization_usage(
    org_id: int,
    admin: User = Depends(require_platform_admin),
    db: Session = Depends(get_db),
):
    """Reset monthly usage counters for an organization."""
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    old_sim = org.simulation_runs_this_month
    old_exp = org.experiment_runs_this_month

    org.simulation_runs_this_month = 0
    org.experiment_runs_this_month = 0
    org.usage_alert_80_sent = False
    org.usage_alert_100_sent = False
    db.commit()

    logger.info(
        f"Admin reset usage for org {org_id} ({org.domain}): "
        f"simulation_runs {old_sim} -> 0, experiment_runs {old_exp} -> 0 - "
        f"by {admin.email}"
    )

    return {"status": "reset", "org_id": org_id}


# =============================================================================
# USER MANAGEMENT (Cross-org)
# =============================================================================

@router.get("/users", response_model=List[UserSummary])
def list_all_users(
    org_id: Optional[int] = None,
    role: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(default=50, le=200),
    offset: int = 0,
    admin: User = Depends(require_platform_admin),
    db: Session = Depends(get_db),
):
    """List users across all organizations."""
    logger.info(f"Admin user list accessed by {admin.email}")

    query = db.query(User).join(Organization)

    if org_id:
        query = query.filter(User.organization_id == org_id)

    if role:
        query = query.filter(User.role == role)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (User.email.ilike(search_term)) |
            (User.name.ilike(search_term))
        )

    users = query.order_by(User.created_at.desc()).offset(offset).limit(limit).all()

    return [
        UserSummary(
            id=u.id,
            email=u.email,
            name=u.name,
            role=u.role,
            is_approved=u.is_approved,
            email_verified=u.email_verified,
            organization_id=u.organization_id,
            organization_name=u.organization.name if u.organization else None,
            created_at=u.created_at,
            last_login_at=u.last_login_at,
        )
        for u in users
    ]


@router.post("/users/{user_id}/approve")
def admin_approve_user(
    user_id: int,
    admin: User = Depends(require_platform_admin),
    db: Session = Depends(get_db),
):
    """Approve a user (cross-org admin action)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_approved = True
    db.commit()

    logger.info(f"Admin approved user {user_id} ({user.email}) - by {admin.email}")

    return {"status": "approved", "user_id": user_id}


@router.delete("/users/{user_id}")
def admin_delete_user(
    user_id: int,
    admin: User = Depends(require_platform_admin),
    db: Session = Depends(get_db),
):
    """Delete a user (cross-org admin action). Use with caution."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent deleting yourself
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    email = user.email
    db.delete(user)
    db.commit()

    logger.warning(f"Admin deleted user {user_id} ({email}) - by {admin.email}")

    return {"status": "deleted", "user_id": user_id}
