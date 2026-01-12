"""
Security utilities for authentication.

Includes:
- Password hashing (bcrypt)
- JWT token creation/verification
- HTTP-only cookie management
- Account lockout after failed attempts
- Current user dependency
"""
from datetime import datetime, timedelta
from typing import Optional
import logging

import bcrypt
from fastapi import Depends, HTTPException, status, Response, Cookie, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.db.database import get_db
from app.db.models import User, Organization

logger = logging.getLogger(__name__)

# OAuth2 scheme - supports both cookie and bearer token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


# =============================================================================
# PASSWORD HASHING
# =============================================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


# =============================================================================
# JWT TOKENS
# =============================================================================

def create_access_token(sub: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.

    Args:
        sub: Subject (typically user email or ID)
        expires_delta: Optional custom expiry time
    """
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    to_encode = {"sub": sub, "exp": expire, "type": "access"}
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def create_refresh_token(sub: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT refresh token (longer-lived)."""
    expire = datetime.utcnow() + (
        expires_delta or timedelta(days=settings.refresh_token_expire_days)
    )
    to_encode = {"sub": sub, "exp": expire, "type": "refresh"}
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> Optional[str]:
    """
    Decode and verify an access token.

    Returns the subject (email) if valid, None otherwise.
    """
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm]
        )
        # Only accept access tokens (not refresh tokens)
        if payload.get("type") not in (None, "access"):
            return None
        return payload.get("sub")
    except JWTError:
        return None


def verify_refresh_token(token: str) -> Optional[str]:
    """
    Verify a refresh token.

    Returns the subject (email) if valid, None otherwise.
    """
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm]
        )
        if payload.get("type") != "refresh":
            return None
        return payload.get("sub")
    except JWTError:
        return None


# =============================================================================
# COOKIES
# =============================================================================

def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Set HTTP-only authentication cookies."""

    def _set_cookie(key: str, value: str, max_age: int):
        kwargs = {
            "httponly": True,
            "secure": settings.cookie_secure,
            "samesite": settings.cookie_samesite,
            "path": "/",
            "max_age": max_age,
        }
        if settings.cookie_domain:
            kwargs["domain"] = settings.cookie_domain
        response.set_cookie(key=key, value=value, **kwargs)

    _set_cookie("access_token", access_token, settings.access_token_expire_minutes * 60)
    _set_cookie("refresh_token", refresh_token, settings.refresh_token_expire_days * 24 * 3600)


def clear_auth_cookies(response: Response) -> None:
    """Clear authentication cookies."""
    kwargs = {"path": "/"}
    if settings.cookie_domain:
        kwargs["domain"] = settings.cookie_domain
    response.delete_cookie("access_token", **kwargs)
    response.delete_cookie("refresh_token", **kwargs)


# =============================================================================
# ACCOUNT LOCKOUT
# =============================================================================

def check_account_lockout(user: User) -> tuple[bool, int]:
    """
    Check if account is locked due to failed login attempts.

    Returns:
        (is_locked, seconds_remaining)
    """
    if not user.locked_until:
        return False, 0

    now = datetime.utcnow()
    if user.locked_until > now:
        remaining = int((user.locked_until - now).total_seconds())
        return True, remaining

    return False, 0


def record_failed_login(db: Session, user: User, ip: str) -> None:
    """Record a failed login attempt and potentially lock the account."""
    user.failed_login_attempts = (user.failed_login_attempts or 0) + 1

    if user.failed_login_attempts >= settings.max_failed_login_attempts:
        user.locked_until = datetime.utcnow() + timedelta(
            minutes=settings.lockout_duration_minutes
        )
        logger.warning(
            f"Account locked: email={user.email}, ip={ip}, "
            f"attempts={user.failed_login_attempts}"
        )

    db.commit()
    logger.info(f"Failed login: email={user.email}, ip={ip}, attempts={user.failed_login_attempts}")


def record_successful_login(db: Session, user: User, ip: str) -> None:
    """Record a successful login, reset failed attempts counter."""
    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = datetime.utcnow()
    user.last_login_ip = ip
    db.commit()
    logger.info(f"Successful login: email={user.email}, ip={ip}")


def get_client_ip(request: Request) -> str:
    """Extract client IP address, handling proxies."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# =============================================================================
# CURRENT USER DEPENDENCIES
# =============================================================================

def get_current_user(
    db: Session = Depends(get_db),
    bearer: Optional[str] = Depends(oauth2_scheme),
    access_cookie: Optional[str] = Cookie(None, alias="access_token"),
) -> Optional[User]:
    """
    Get the current authenticated user from token (cookie or bearer).

    Returns None if not authenticated (for optional auth endpoints).
    """
    # Prefer cookie, fall back to bearer
    token = access_cookie or bearer or ""

    if not token:
        return None

    email = decode_access_token(token)
    if not email:
        return None

    user = db.query(User).filter(User.email == email).first()
    return user


def get_current_user_required(
    user: Optional[User] = Depends(get_current_user)
) -> User:
    """
    Get the current user, raising 401 if not authenticated.

    Use this for endpoints that require authentication.
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_current_approved_user(
    user: User = Depends(get_current_user_required)
) -> User:
    """
    Get current user, requiring approval status.

    Raises 403 if user is not approved by org admin.
    """
    if not user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account pending approval. Contact your organization administrator."
        )
    return user


def get_current_verified_user(
    user: User = Depends(get_current_approved_user)
) -> User:
    """
    Get current user, requiring email verification.

    Raises 403 if email not verified.
    """
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please check your inbox."
        )
    return user


# =============================================================================
# ROLE-BASED ACCESS
# =============================================================================

def require_role(*allowed_roles: str):
    """
    Dependency factory for role-based access control.

    Usage:
        @router.get("/admin")
        def admin_endpoint(user: User = Depends(require_role("OWNER", "ADMIN"))):
            ...
    """
    def dependency(user: User = Depends(get_current_approved_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of roles: {', '.join(allowed_roles)}"
            )
        return user
    return dependency


# =============================================================================
# AXION CHECK
# =============================================================================

def is_axion_user(user: User) -> bool:
    """
    Check if user belongs to Axion Deep Labs (unlimited access).

    Uses environment variable for authoritative check.
    """
    return settings.is_axion_org(user.organization_id)
