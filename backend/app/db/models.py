"""Database models for QUANTA."""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON, Enum
)
from sqlalchemy.orm import relationship
import enum

from app.db.database import Base


class AccountType(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    STUDENT = "student"
    ORG_MEMBER = "org_member"


class OrgRole(str, enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"


class OrgPlan(str, enum.Enum):
    TEAM = "team"
    UNIVERSITY = "university"
    ENTERPRISE = "enterprise"


class Organization(Base):
    """Organization model for universities/companies."""
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    domain = Column(String(255), unique=True, index=True)  # e.g., stanford.edu
    plan = Column(Enum(OrgPlan), default=OrgPlan.TEAM)
    seats_purchased = Column(Integer, default=10)
    seats_used = Column(Integer, default=0)

    # Stripe billing
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    users = relationship("User", back_populates="organization")
    circuits = relationship("Circuit", back_populates="organization")


class User(Base):
    """User model."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=True)

    # Account type and limits
    account_type = Column(Enum(AccountType), default=AccountType.FREE)
    is_student = Column(Boolean, default=False)  # Auto-detected from .edu email
    circuits_limit = Column(Integer, default=3)  # Free tier limit

    # Organization membership (nullable for individual accounts)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    org_role = Column(Enum(OrgRole), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    organization = relationship("Organization", back_populates="users")
    circuits = relationship("Circuit", back_populates="user")
    progress = relationship("Progress", back_populates="user")

    @property
    def is_edu_email(self) -> bool:
        """Check if email is from educational domain."""
        return self.email.endswith(".edu")


class Circuit(Base):
    """Saved quantum circuit."""
    __tablename__ = "circuits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)

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


class Progress(Base):
    """User lesson progress."""
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(String(100), nullable=False, index=True)

    current_section = Column(Integer, default=0)
    completed_sections = Column(JSON, default=list)  # List of section indices
    completed = Column(Boolean, default=False)

    last_accessed_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="progress")

    # Composite unique constraint
    __table_args__ = (
        # Each user can only have one progress record per lesson
    )
