"""
Authentication API routes.

Handles login, logout, token refresh, and current user info.
Signup is handled in orgs.py (creates org + user together).
"""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User, Organization
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
    set_auth_cookies,
    clear_auth_cookies,
    check_account_lockout,
    record_failed_login,
    record_successful_login,
    get_client_ip,
    get_current_user_required,
    is_axion_user,
)
from app.core.plans import get_usage_summary

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# =============================================================================
# RESPONSE MODELS
# =============================================================================

class OrganizationResponse(BaseModel):
    id: int
    name: Optional[str]
    plan: str
    is_axion: bool

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: int
    email: str
    name: Optional[str]
    role: str
    is_approved: bool
    email_verified: bool
    organization: OrganizationResponse

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class MeResponse(BaseModel):
    user: UserResponse
    usage: dict


# =============================================================================
# LOGIN
# =============================================================================

@router.post("/login", response_model=TokenResponse)
def login(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Login with email and password.

    Sets HTTP-only cookies for access and refresh tokens.
    Also returns access token in response body for clients that prefer headers.
    """
    client_ip = get_client_ip(request)
    email = form_data.username.lower().strip()

    # Find user
    user = db.query(User).filter(User.email == email).first()

    # Check lockout BEFORE attempting auth
    if user:
        is_locked, seconds_remaining = check_account_lockout(user)
        if is_locked:
            minutes = (seconds_remaining // 60) + 1
            logger.warning(f"Login attempt on locked account: email={email}, ip={client_ip}")
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"Account temporarily locked. Try again in {minutes} minutes."
            )

    # Verify credentials
    if not user or not verify_password(form_data.password, user.hashed_password):
        if user:
            record_failed_login(db, user, client_ip)
        else:
            logger.info(f"Failed login (unknown user): email={email}, ip={client_ip}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Check user has an organization
    if not user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User not associated with an organization"
        )

    # Record successful login
    record_successful_login(db, user, client_ip)

    # Create tokens
    access_token = create_access_token(user.email)
    refresh_token = create_refresh_token(user.email)

    # Set cookies
    set_auth_cookies(response, access_token, refresh_token)

    # Get organization
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()

    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            is_approved=user.is_approved,
            email_verified=user.email_verified,
            organization=OrganizationResponse(
                id=org.id,
                name=org.name,
                plan=org.plan,
                is_axion=is_axion_user(user),
            )
        )
    )


# =============================================================================
# TOKEN REFRESH
# =============================================================================

@router.post("/refresh", response_model=TokenResponse)
def refresh_tokens(
    response: Response,
    db: Session = Depends(get_db),
    refresh_cookie: Optional[str] = Cookie(default=None, alias="refresh_token"),
):
    """
    Refresh access token using refresh token from cookie.
    """
    if not refresh_cookie:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token"
        )

    # Verify refresh token
    email = verify_refresh_token(refresh_cookie)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    # Get user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    # Create new tokens
    new_access_token = create_access_token(user.email)
    new_refresh_token = create_refresh_token(user.email)

    # Set cookies
    set_auth_cookies(response, new_access_token, new_refresh_token)

    # Get organization
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()

    return TokenResponse(
        access_token=new_access_token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            is_approved=user.is_approved,
            email_verified=user.email_verified,
            organization=OrganizationResponse(
                id=org.id,
                name=org.name,
                plan=org.plan,
                is_axion=is_axion_user(user),
            )
        )
    )


# =============================================================================
# LOGOUT
# =============================================================================

@router.post("/logout")
def logout(response: Response):
    """
    Logout by clearing authentication cookies.

    Client should also discard any stored tokens.
    """
    clear_auth_cookies(response)
    return {"ok": True}


# =============================================================================
# CURRENT USER
# =============================================================================

@router.get("/me", response_model=MeResponse)
def get_me(
    user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    """
    Get current user info and usage stats.
    """
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()

    return MeResponse(
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            is_approved=user.is_approved,
            email_verified=user.email_verified,
            organization=OrganizationResponse(
                id=org.id,
                name=org.name,
                plan=org.plan,
                is_axion=is_axion_user(user),
            )
        ),
        usage=get_usage_summary(org),
    )


# =============================================================================
# EMAIL VERIFICATION
# =============================================================================

@router.post("/verify-email/send")
def send_verification_email_endpoint(
    user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    """
    Send (or resend) email verification to current user.
    """
    if user.email_verified:
        return {"message": "Email already verified"}

    from app.services.email import send_verification_email

    success = send_verification_email(user, db)

    if success:
        return {"message": "Verification email sent"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email"
        )


@router.post("/verify-email/{token}")
def verify_email(
    token: str,
    db: Session = Depends(get_db),
):
    """
    Verify email address using token from email link.
    """
    from app.services.email import verify_email_token

    user = verify_email_token(token, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )

    return {
        "message": "Email verified successfully",
        "email": user.email,
    }
