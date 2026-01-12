"""
Database models for QUANTA Platform.

Multi-tenant architecture with hard limits for external tenants.
Axion Deep Labs tenant identified via AXION_ORG_ID environment variable.
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON,
    Numeric, UniqueConstraint
)
from sqlalchemy.orm import relationship

from app.db.database import Base


# =============================================================================
# TENANT (ORGANIZATION)
# =============================================================================

class Organization(Base):
    """
    Tenant entity - educational institutions or Axion Deep Labs.

    Cost Control: Every org has hard limits. Axion org (identified by env var)
    has elevated/unlimited access for DRIFT research.
    """
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=True)
    domain = Column(String(255), unique=True, index=True, nullable=False)
    api_key = Column(String(64), unique=True, index=True, nullable=True)

    # Plan and billing
    plan = Column(String(50), nullable=False, default="free")  # free, education, research
    billing_cycle = Column(String(20), nullable=False, default="monthly")
    subscription_status = Column(String(20), nullable=False, default="inactive")

    # Stripe
    stripe_customer_id = Column(String(255), index=True, nullable=True)
    stripe_subscription_id = Column(String(255), index=True, nullable=True)
    current_period_end = Column(DateTime, nullable=True)

    # Trial
    trial_started_at = Column(DateTime, nullable=True)
    trial_ends_at = Column(DateTime, nullable=True)

    # === USAGE TRACKING (Cost Control) ===
    simulation_runs_this_month = Column(Integer, nullable=False, default=0)
    simulation_runs_limit = Column(Integer, nullable=False, default=100)  # Hard limit

    circuits_count = Column(Integer, nullable=False, default=0)
    circuits_limit = Column(Integer, nullable=False, default=10)  # Hard limit

    storage_bytes_used = Column(Integer, nullable=False, default=0)
    storage_bytes_limit = Column(Integer, nullable=False, default=52428800)  # 50MB default

    # DRIFT: Experiment limits (only Axion gets meaningful limits here)
    experiments_count = Column(Integer, nullable=False, default=0)
    experiments_limit = Column(Integer, nullable=False, default=0)  # 0 = disabled for non-research
    experiment_runs_this_month = Column(Integer, nullable=False, default=0)
    experiment_runs_limit = Column(Integer, nullable=False, default=0)  # 0 = disabled

    # Usage reset tracking
    usage_month_reset = Column(DateTime, nullable=True)

    # Alerts (internal tracking, not exposed to user)
    usage_alert_80_sent = Column(Boolean, nullable=False, default=False)
    usage_alert_100_sent = Column(Boolean, nullable=False, default=False)

    # Institution info
    institution_type = Column(String(50), nullable=True)  # university, research_lab, individual

    # Branding (for white-label, future)
    logo_url = Column(String(512), nullable=True)
    primary_color = Column(String(7), nullable=True)  # hex color

    # Onboarding
    onboarding_completed = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    users = relationship("User", back_populates="organization")
    circuits = relationship("Circuit", back_populates="organization")
    progress_records = relationship("Progress", back_populates="organization")
    experiments = relationship("Experiment", back_populates="organization")


# =============================================================================
# USER
# =============================================================================

class User(Base):
    """
    User belonging to an organization (tenant).

    Roles: OWNER, ADMIN, INSTRUCTOR, STUDENT, RESEARCHER
    First user in org becomes OWNER and is auto-approved.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=True)

    # Tenant
    organization_id = Column(
        Integer,
        ForeignKey("organizations.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    # Role: OWNER, ADMIN, INSTRUCTOR, STUDENT, RESEARCHER
    role = Column(String(20), nullable=False, default="STUDENT")

    # First user auto-approved, others need owner/admin approval
    is_approved = Column(Boolean, nullable=False, default=False)

    # Default user for org (receives notifications, etc.)
    is_default = Column(Boolean, nullable=False, default=False)

    # Email verification
    email_verified = Column(Boolean, nullable=False, default=False)
    email_verification_token = Column(String(100), nullable=True, index=True)
    email_verification_sent_at = Column(DateTime, nullable=True)

    # Security: Account lockout
    failed_login_attempts = Column(Integer, nullable=False, default=0)
    locked_until = Column(DateTime, nullable=True)
    last_login_at = Column(DateTime, nullable=True)
    last_login_ip = Column(String(45), nullable=True)  # IPv6 max length

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="users")
    circuits = relationship("Circuit", back_populates="user")
    progress = relationship("Progress", back_populates="user")
    experiments_created = relationship("Experiment", back_populates="researcher")


# =============================================================================
# EDUCATION: Progress & Circuits
# =============================================================================

class Progress(Base):
    """
    User lesson progress.
    Includes organization_id for tenant isolation and analytics.
    """
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(
        Integer,
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    lesson_id = Column(String(100), nullable=False, index=True)
    current_section = Column(Integer, default=0)
    completed_sections = Column(JSON, default=list)  # List of section indices
    quiz_scores = Column(JSON, default=dict)  # {section_id: score}
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

    last_accessed_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="progress")
    organization = relationship("Organization", back_populates="progress_records")

    __table_args__ = (
        UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson"),
    )


class Circuit(Base):
    """
    Saved quantum circuit.
    Count enforced against org.circuits_limit (hard cap).
    """
    __tablename__ = "circuits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(
        Integer,
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    num_qubits = Column(Integer, default=2)
    gates = Column(JSON, default=list)  # List of gate definitions

    # Sharing
    is_public = Column(Boolean, default=False)
    is_org_shared = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="circuits")
    organization = relationship("Organization", back_populates="circuits")


# =============================================================================
# DRIFT: Research Experiments
# =============================================================================

class Experiment(Base):
    """
    DRIFT research experiment definition.

    Only available to organizations with experiments_limit > 0
    (typically only Axion Deep Labs).
    """
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(
        Integer,
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    researcher_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    name = Column(String(255), nullable=False)
    hypothesis = Column(Text, nullable=True)
    description = Column(Text, nullable=True)

    # Configuration
    config = Column(JSON, default=dict)  # Operator sequences, parameters, etc.

    # Status: draft, running, paused, completed, archived
    status = Column(String(20), nullable=False, default="draft")

    # Metadata
    tags = Column(JSON, default=list)  # For categorization

    # Reproducibility
    random_seed = Column(Integer, nullable=True)  # For deterministic runs
    version = Column(Integer, nullable=False, default=1)  # Config versioning

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    organization = relationship("Organization", back_populates="experiments")
    researcher = relationship("User", back_populates="experiments_created")
    runs = relationship("ExperimentRun", back_populates="experiment", cascade="all, delete-orphan")


class ExperimentRun(Base):
    """
    Individual execution of an experiment with specific parameters.

    Each run captures inputs, outputs, and timing for reproducibility.
    """
    __tablename__ = "experiment_runs"

    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(
        Integer,
        ForeignKey("experiments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Run parameters (may vary from base experiment config)
    parameters = Column(JSON, default=dict)

    # Input state
    initial_state = Column(JSON, nullable=True)
    operator_sequence = Column(JSON, nullable=True)  # Gates applied

    # Results
    results = Column(JSON, default=dict)  # State distributions, measurements
    final_state = Column(JSON, nullable=True)

    # Metrics
    iterations = Column(Integer, nullable=True)
    execution_time_ms = Column(Integer, nullable=True)

    # Status: pending, running, completed, failed
    status = Column(String(20), nullable=False, default="pending")
    error_message = Column(Text, nullable=True)

    executed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    experiment = relationship("Experiment", back_populates="runs")
