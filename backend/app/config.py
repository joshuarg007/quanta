"""
QUANTA Backend Configuration

Priority Order (per CLAUDE.md):
1. Legal Protection
2. Science
3. Cost-Efficiency
4. Functionality
5. User-Friendliness

AXION_ORG_ID: Environment variable identifying Axion Deep Labs tenant.
- If set, that org gets unlimited access for DRIFT research.
- If not set (0), no org has elevated access (fail-safe).
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Optional
import os


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    # ==========================================================================
    # Application
    # ==========================================================================
    version: str = "0.2.0"
    environment: str = "development"  # development | staging | production
    debug: bool = True

    # ==========================================================================
    # Axion Deep Labs Tenant (DRIFT Research)
    # ==========================================================================
    # This is the authoritative identifier for the Axion internal org.
    # Set after initial org is seeded. 0 = not set (fail-safe, no unlimited access).
    axion_org_id: int = 0

    # Domain for auto-assignment of new Axion employees
    axion_domain: str = "axiondeep.com"

    # ==========================================================================
    # Database
    # ==========================================================================
    database_url: str = "sqlite:////home/joshua/AllProjects/quanta/backend/quanta.db"

    # ==========================================================================
    # JWT Authentication
    # ==========================================================================
    # CRITICAL: Override secret_key in production via QUANTA_SECRET_KEY env var
    secret_key: str = "CHANGE_ME_IN_PRODUCTION_USE_SECRETS_TOKEN_URLSAFE_32"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # ==========================================================================
    # Cookie Security
    # ==========================================================================
    cookie_secure: bool = False  # True in production (HTTPS only)
    cookie_samesite: str = "lax"  # lax | strict | none
    cookie_domain: Optional[str] = None  # e.g., ".axiondeep.com" for cross-subdomain

    # ==========================================================================
    # CORS
    # ==========================================================================
    cors_origins: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]

    # ==========================================================================
    # Quantum Simulation
    # ==========================================================================
    max_qubits: int = 16
    default_shots: int = 1024

    # ==========================================================================
    # Default Limits (Cost Control)
    # These are applied to new organizations. Axion org overrides these.
    # ==========================================================================
    default_simulation_runs_limit: int = 100
    default_circuits_limit: int = 10
    default_storage_bytes_limit: int = 52428800  # 50MB

    # Education tier (pro bono) gets more generous limits
    education_simulation_runs_limit: int = 500
    education_circuits_limit: int = 50
    education_storage_bytes_limit: int = 104857600  # 100MB

    # Axion/Research tier (unlimited represented as -1)
    axion_simulation_runs_limit: int = -1  # Unlimited
    axion_circuits_limit: int = -1
    axion_storage_bytes_limit: int = -1
    axion_experiments_limit: int = -1
    axion_experiment_runs_limit: int = -1

    # ==========================================================================
    # Stripe (for add-on purchases)
    # ==========================================================================
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    # ==========================================================================
    # Email (for verification, notifications)
    # ==========================================================================
    email_enabled: bool = False
    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    email_from_address: str = "noreply@axiondeep.com"
    email_from_name: str = "QUANTA"

    # ==========================================================================
    # Security
    # ==========================================================================
    max_failed_login_attempts: int = 5
    lockout_duration_minutes: int = 15

    # ==========================================================================
    # Frontend URLs (for email links, redirects)
    # ==========================================================================
    frontend_base_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        env_prefix = "QUANTA_"
        extra = "ignore"

    @field_validator("environment")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        allowed = {"development", "staging", "production"}
        if v.lower() not in allowed:
            raise ValueError(f"environment must be one of: {allowed}")
        return v.lower()

    @field_validator("secret_key")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if v == "CHANGE_ME_IN_PRODUCTION_USE_SECRETS_TOKEN_URLSAFE_32":
            import warnings
            warnings.warn(
                "Using default secret_key! Set QUANTA_SECRET_KEY in production.",
                UserWarning
            )
        return v

    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment == "production"

    def is_axion_org(self, org_id: int) -> bool:
        """
        Check if an organization is Axion Deep Labs (unlimited access).

        This is the authoritative check. Uses env var, not domain.
        """
        return self.axion_org_id > 0 and org_id == self.axion_org_id

    def get_limits_for_plan(self, plan: str) -> dict:
        """
        Get default limits for a plan type.

        Returns dict with limit values. -1 means unlimited.
        """
        if plan == "research" or plan == "axion":
            return {
                "simulation_runs_limit": self.axion_simulation_runs_limit,
                "circuits_limit": self.axion_circuits_limit,
                "storage_bytes_limit": self.axion_storage_bytes_limit,
                "experiments_limit": self.axion_experiments_limit,
                "experiment_runs_limit": self.axion_experiment_runs_limit,
            }
        elif plan == "education":
            return {
                "simulation_runs_limit": self.education_simulation_runs_limit,
                "circuits_limit": self.education_circuits_limit,
                "storage_bytes_limit": self.education_storage_bytes_limit,
                "experiments_limit": 0,
                "experiment_runs_limit": 0,
            }
        else:  # free
            return {
                "simulation_runs_limit": self.default_simulation_runs_limit,
                "circuits_limit": self.default_circuits_limit,
                "storage_bytes_limit": self.default_storage_bytes_limit,
                "experiments_limit": 0,
                "experiment_runs_limit": 0,
            }


# Singleton instance
settings = Settings()

# Production validation warnings
if settings.is_production():
    issues = []
    if not settings.stripe_secret_key:
        issues.append("STRIPE_SECRET_KEY not set")
    if settings.secret_key == "CHANGE_ME_IN_PRODUCTION_USE_SECRETS_TOKEN_URLSAFE_32":
        issues.append("SECRET_KEY using default value")
    if settings.axion_org_id == 0:
        issues.append("AXION_ORG_ID not set (no org has unlimited access)")

    if issues:
        import logging
        logger = logging.getLogger("app.config")
        for issue in issues:
            logger.warning(f"Production config warning: {issue}")
