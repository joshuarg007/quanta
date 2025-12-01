"""Authentication API routes."""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User, AccountType
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    verify_token,
    get_current_user_required,
)
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    name: Optional[str]
    account_type: str
    is_student: bool
    circuits_limit: int
    organization_id: Optional[int]

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshRequest(BaseModel):
    refresh_token: str


def is_edu_email(email: str) -> bool:
    """Check if email is from educational domain."""
    return email.lower().endswith(".edu")


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Determine account type
    is_student = is_edu_email(user_data.email)
    account_type = AccountType.STUDENT if is_student else AccountType.FREE
    circuits_limit = settings.pro_circuits_limit if is_student else settings.free_circuits_limit

    # Create user
    user = User(
        email=user_data.email.lower(),
        hashed_password=get_password_hash(user_data.password),
        name=user_data.name,
        account_type=account_type,
        is_student=is_student,
        circuits_limit=circuits_limit,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            account_type=user.account_type.value,
            is_student=user.is_student,
            circuits_limit=user.circuits_limit,
            organization_id=user.organization_id,
        )
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login and get access tokens."""
    user = db.query(User).filter(User.email == form_data.username.lower()).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()

    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            account_type=user.account_type.value,
            is_student=user.is_student,
            circuits_limit=user.circuits_limit,
            organization_id=user.organization_id,
        )
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    data: RefreshRequest,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token."""
    payload = verify_token(data.refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    # Create new tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            account_type=user.account_type.value,
            is_student=user.is_student,
            circuits_limit=user.circuits_limit,
            organization_id=user.organization_id,
        )
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user_required)):
    """Get current user info."""
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        account_type=user.account_type.value,
        is_student=user.is_student,
        circuits_limit=user.circuits_limit,
        organization_id=user.organization_id,
    )


@router.post("/logout")
async def logout():
    """Logout (client should discard tokens)."""
    return {"message": "Logged out successfully"}
