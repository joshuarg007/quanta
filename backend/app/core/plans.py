"""
Plan definitions and limit enforcement for QUANTA.

Cost Control Mandate:
- Preventing ridiculous costs must be hardwired into every aspect of this application.
- External tenants have hard limits on all resource-consuming operations.
- Limits are enforced at database, API, and UI layers (defense in depth).
- Exceeding limits = blocked (not just warned).
- Axion Deep Labs tenant has elevated/unlimited access for DRIFT research.

Priority Order:
1. Legal Protection
2. Science
3. Cost-Efficiency  <-- This module
4. Functionality
5. User-Friendliness
"""
from dataclasses import dataclass
from typing import Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.config import settings
from app.db.models import Organization


@dataclass
class PlanLimits:
    """Limits for a plan tier. -1 means unlimited."""
    simulation_runs_per_month: int
    circuits: int
    storage_bytes: int
    experiments: int  # 0 = disabled, -1 = unlimited
    experiment_runs_per_month: int


# Plan definitions
PLANS = {
    "free": PlanLimits(
        simulation_runs_per_month=100,
        circuits=10,
        storage_bytes=52428800,  # 50MB
        experiments=0,
        experiment_runs_per_month=0,
    ),
    "education": PlanLimits(
        simulation_runs_per_month=500,
        circuits=50,
        storage_bytes=104857600,  # 100MB
        experiments=0,
        experiment_runs_per_month=0,
    ),
    "research": PlanLimits(
        simulation_runs_per_month=-1,  # Unlimited
        circuits=-1,
        storage_bytes=-1,
        experiments=-1,
        experiment_runs_per_month=-1,
    ),
}


def get_plan_limits(plan: str) -> PlanLimits:
    """Get limits for a plan, defaulting to free if unknown."""
    return PLANS.get(plan, PLANS["free"])


# =============================================================================
# LIMIT CHECKING (Cost Control)
# =============================================================================

class LimitExceededError(Exception):
    """Raised when an organization exceeds a hard limit."""

    def __init__(self, limit_type: str, current: int, limit: int, message: str = None):
        self.limit_type = limit_type
        self.current = current
        self.limit = limit
        self.message = message or f"{limit_type} limit exceeded: {current}/{limit}"
        super().__init__(self.message)


def check_simulation_limit(org: Organization) -> None:
    """
    Check if organization can run another simulation.

    Raises LimitExceededError if at or over limit.
    Cost Control: This is a HARD block, not a warning.
    """
    # -1 means unlimited (Axion)
    if org.simulation_runs_limit == -1:
        return

    if org.simulation_runs_this_month >= org.simulation_runs_limit:
        raise LimitExceededError(
            "simulation_runs",
            org.simulation_runs_this_month,
            org.simulation_runs_limit,
            f"Monthly simulation limit reached ({org.simulation_runs_limit}). "
            "Contact your administrator or purchase additional runs."
        )


def check_circuit_limit(org: Organization) -> None:
    """
    Check if organization can create another circuit.

    Raises LimitExceededError if at or over limit.
    """
    if org.circuits_limit == -1:
        return

    if org.circuits_count >= org.circuits_limit:
        raise LimitExceededError(
            "circuits",
            org.circuits_count,
            org.circuits_limit,
            f"Circuit limit reached ({org.circuits_limit}). "
            "Delete unused circuits or contact your administrator."
        )


def check_storage_limit(org: Organization, additional_bytes: int = 0) -> None:
    """
    Check if organization can use additional storage.

    Args:
        org: Organization to check
        additional_bytes: How many bytes will be added
    """
    if org.storage_bytes_limit == -1:
        return

    projected = org.storage_bytes_used + additional_bytes
    if projected > org.storage_bytes_limit:
        raise LimitExceededError(
            "storage",
            org.storage_bytes_used,
            org.storage_bytes_limit,
            f"Storage limit would be exceeded. Current: {org.storage_bytes_used}, "
            f"Limit: {org.storage_bytes_limit}, Requested: {additional_bytes}"
        )


def check_experiment_limit(org: Organization) -> None:
    """
    Check if organization can create another experiment.

    Only Axion (research plan) can create experiments.
    """
    # 0 means feature disabled
    if org.experiments_limit == 0:
        raise LimitExceededError(
            "experiments",
            0,
            0,
            "Experiments are not available on your plan. "
            "This feature is reserved for research organizations."
        )

    if org.experiments_limit == -1:
        return

    if org.experiments_count >= org.experiments_limit:
        raise LimitExceededError(
            "experiments",
            org.experiments_count,
            org.experiments_limit,
            f"Experiment limit reached ({org.experiments_limit})."
        )


def check_experiment_run_limit(org: Organization) -> None:
    """
    Check if organization can run another experiment.
    """
    if org.experiment_runs_limit == 0:
        raise LimitExceededError(
            "experiment_runs",
            0,
            0,
            "Experiment runs are not available on your plan."
        )

    if org.experiment_runs_limit == -1:
        return

    if org.experiment_runs_this_month >= org.experiment_runs_limit:
        raise LimitExceededError(
            "experiment_runs",
            org.experiment_runs_this_month,
            org.experiment_runs_limit,
            f"Monthly experiment run limit reached ({org.experiment_runs_limit})."
        )


# =============================================================================
# USAGE TRACKING
# =============================================================================

def increment_simulation_count(db: Session, org: Organization) -> None:
    """
    Increment simulation run count for organization.

    Call this AFTER check_simulation_limit passes.
    """
    _maybe_reset_monthly_usage(db, org)
    org.simulation_runs_this_month += 1
    db.commit()


def increment_circuit_count(db: Session, org: Organization) -> None:
    """Increment circuit count for organization."""
    org.circuits_count += 1
    db.commit()


def decrement_circuit_count(db: Session, org: Organization) -> None:
    """Decrement circuit count when a circuit is deleted."""
    if org.circuits_count > 0:
        org.circuits_count -= 1
        db.commit()


def increment_experiment_count(db: Session, org: Organization) -> None:
    """Increment experiment count for organization."""
    org.experiments_count += 1
    db.commit()


def decrement_experiment_count(db: Session, org: Organization) -> None:
    """Decrement experiment count when an experiment is deleted."""
    if org.experiments_count > 0:
        org.experiments_count -= 1
        db.commit()


def increment_experiment_run_count(db: Session, org: Organization) -> None:
    """Increment experiment run count for organization."""
    _maybe_reset_monthly_usage(db, org)
    org.experiment_runs_this_month += 1
    db.commit()


def update_storage_usage(db: Session, org: Organization, delta_bytes: int) -> None:
    """
    Update storage usage for organization.

    Args:
        delta_bytes: Positive to add, negative to subtract
    """
    org.storage_bytes_used = max(0, org.storage_bytes_used + delta_bytes)
    db.commit()


def _maybe_reset_monthly_usage(db: Session, org: Organization) -> None:
    """Reset monthly counters if we're in a new month."""
    now = datetime.utcnow()

    # If no reset date set, or we're past the reset date
    if not org.usage_month_reset or now >= org.usage_month_reset:
        # Reset counters
        org.simulation_runs_this_month = 0
        org.experiment_runs_this_month = 0
        org.usage_alert_80_sent = False
        org.usage_alert_100_sent = False

        # Set next reset to first of next month
        if now.month == 12:
            next_reset = datetime(now.year + 1, 1, 1)
        else:
            next_reset = datetime(now.year, now.month + 1, 1)

        org.usage_month_reset = next_reset
        db.commit()


# =============================================================================
# USAGE REPORTING
# =============================================================================

def get_usage_summary(org: Organization) -> dict:
    """
    Get usage summary for an organization.

    Returns dict with current usage and limits.
    """
    def _format_limit(current: int, limit: int) -> dict:
        return {
            "current": current,
            "limit": limit if limit != -1 else "unlimited",
            "percent": (current / limit * 100) if limit > 0 else 0,
            "remaining": (limit - current) if limit > 0 else "unlimited",
        }

    return {
        "simulation_runs": _format_limit(
            org.simulation_runs_this_month,
            org.simulation_runs_limit
        ),
        "circuits": _format_limit(
            org.circuits_count,
            org.circuits_limit
        ),
        "storage_bytes": _format_limit(
            org.storage_bytes_used,
            org.storage_bytes_limit
        ),
        "experiments": _format_limit(
            org.experiments_count,
            org.experiments_limit
        ),
        "experiment_runs": _format_limit(
            org.experiment_runs_this_month,
            org.experiment_runs_limit
        ),
        "plan": org.plan,
        "resets_at": org.usage_month_reset.isoformat() if org.usage_month_reset else None,
    }


def is_approaching_limit(org: Organization, limit_type: str, threshold: float = 0.8) -> bool:
    """
    Check if organization is approaching a limit (for internal alerts).

    Args:
        org: Organization to check
        limit_type: One of "simulation_runs", "circuits", "storage", "experiments", "experiment_runs"
        threshold: Percentage threshold (0.8 = 80%)
    """
    mappings = {
        "simulation_runs": (org.simulation_runs_this_month, org.simulation_runs_limit),
        "circuits": (org.circuits_count, org.circuits_limit),
        "storage": (org.storage_bytes_used, org.storage_bytes_limit),
        "experiments": (org.experiments_count, org.experiments_limit),
        "experiment_runs": (org.experiment_runs_this_month, org.experiment_runs_limit),
    }

    if limit_type not in mappings:
        return False

    current, limit = mappings[limit_type]

    # -1 or 0 means unlimited or disabled
    if limit <= 0:
        return False

    return (current / limit) >= threshold
