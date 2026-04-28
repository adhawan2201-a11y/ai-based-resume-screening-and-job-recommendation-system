"""Authentication routes — register, login."""

from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from datetime import datetime
from app.database import get_database
from app.auth import hash_password, verify_password, create_access_token
from app.models import UserRegister, UserLogin, UserResponse, TokenResponse, UserRole

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(user_data: UserRegister):
    """Register a new user (candidate or recruiter)."""
    # SECURITY: Prevent anyone from becoming admin via public signup
    if user_data.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative accounts cannot be created via public signup."
        )

    db = get_database()

    # Check if email already exists
    existing = await db.users.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create user document
    user_doc = {
        "name": user_data.name,
        "email": user_data.email.lower(),
        "password": hash_password(user_data.password),
        "role": user_data.role.value,
        "created_at": datetime.utcnow(),
    }

    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Generate JWT
    token = create_access_token(data={"sub": user_id, "role": user_data.role.value})

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            name=user_data.name,
            email=user_data.email.lower(),
            role=user_data.role,
            created_at=user_doc["created_at"],
        ),
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Log in an existing user."""
    db = get_database()

    user = await db.users.find_one({"email": credentials.email.lower()})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    user_id = str(user["_id"])
    token = create_access_token(data={"sub": user_id, "role": user["role"]})

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            name=user["name"],
            email=user["email"],
            role=user["role"],
            created_at=user["created_at"],
        ),
    )


# /auth/me is implemented in main.py to avoid circular imports with dependencies
