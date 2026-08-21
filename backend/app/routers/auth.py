from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.auth.jwt import create_access_token
from app.auth.totp import verify_totp_code
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

def user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        uid=user.id,
        email=user.email,
        name=user.name,
        displayName=user.name,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    ident = req.identifier.lower().strip()
    
    # Match by email, user id, or username (e.g. "partner1", "partner 1", "partner1@2029.app")
    user = db.query(User).filter(
        or_(
            User.email.ilike(ident),
            User.id.ilike(ident),
            User.name.ilike(ident),
            User.email.ilike(f"{ident}@2029.app"),
        )
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or unauthorized",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify 6-digit TOTP code
    is_valid = verify_totp_code(user.totp_secret, req.code)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid 6-digit authenticator code",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_to_response(user),
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return user_to_response(current_user)
