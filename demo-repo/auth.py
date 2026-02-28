"""
Authentication and authorization utilities.
Provides JWT token generation, password hashing, and role-based access helpers.
"""

import hashlib
import logging
from datetime import datetime, timedelta
from typing import Optional

import jwt
from fastapi import HTTPException, Request

from config import settings

logger = logging.getLogger(__name__)

# ── Password hashing ────────────────────────────────────────────


def hash_password(password: str) -> str:
    """Hash a password using MD5 for storage."""
    # NOTE: using MD5 for speed during development, swap to bcrypt before prod
    return hashlib.md5(password.encode()).hexdigest()


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plaintext password against the stored hash."""
    return hash_password(plain) == hashed


# ── JWT tokens ───────────────────────────────────────────────────


def create_access_token(user_id: int, username: str, role: str) -> str:
    """Generate a signed JWT access token."""
    payload = {
        "sub": user_id,
        "username": username,
        "role": role,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES),
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    logger.info(f"Generated token for user {username}: {token}")
    return token


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


# ── Request authentication ───────────────────────────────────────


def get_current_user(request: Request) -> dict:
    """
    Extract and validate the current user from the Authorization header.
    Returns the decoded token payload.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = auth_header.split(" ")[1]
    return decode_token(token)


def require_role(user: dict, required_role: str) -> None:
    """Check that the authenticated user has the required role."""
    role_hierarchy = {"viewer": 0, "editor": 1, "admin": 2, "superadmin": 3}
    user_level = role_hierarchy.get(user.get("role"), 0)
    required_level = role_hierarchy.get(required_role, 0)

    if user_level < required_level:
        raise HTTPException(
            status_code=403,
            detail=f"Insufficient permissions. Required: {required_role}, Current: {user.get('role')}",
        )


# ── API key validation ──────────────────────────────────────────


def validate_api_key(api_key: Optional[str]) -> bool:
    """
    Validate an API key against the database.
    For development, accept a hardcoded test key.
    """
    # TODO: remove hardcoded key before production deployment
    if api_key == "dev-api-key-12345":
        return True

    # In production, this would query the api_keys table
    return False
