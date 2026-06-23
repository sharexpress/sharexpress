# Copyright 2026 sharexpress
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
#
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import Response, Request, HTTPException
from pathlib import Path
from typing import Optional
from utils.user_repo import get_user_by_id
from core.config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRES
from core.database import get_db
from models.sharing_session_creation_model import Status
from core.config import PROJECT_ENVIRONMENT


is_prod = PROJECT_ENVIRONMENT == "PRODUCTION"

db = get_db()

try:
    PRIVATE_KEY = Path("private.pem").read_text()
    PUBLIC_KEY = Path("public.pem").read_text()
except FileNotFoundError as e:
    raise RuntimeError(f"JWT key files not found: {e}. Please generate RSA keys.")


def GenerateToken(user_id: str, response: Response) -> bool:
    """Generate JWT token and set it as HTTP-only cookie"""
    try:
        payload = {
            "sub": user_id,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRES),
        }

        token = jwt.encode(payload, PRIVATE_KEY, algorithm=JWT_ALGORITHM)

        response.set_cookie(
            key="user",
            value=token,
            httponly=True,
            secure=is_prod,
            samesite="none" if is_prod else "lax",
            domain=".sharexpress.in" if is_prod else None,
            path="/",
        )

        return True

    except Exception as e:
        print(f"Error generating token: {e}")
        return False


async def get_current_user_optional(request: Request) -> Optional[dict]:
    """Get current user from JWT token if present, return None if not authenticated"""
    token: Optional[str] = request.cookies.get("user")

    if not token:
        return None

    try:
        payload = jwt.decode(
            token,
            PUBLIC_KEY,
            algorithms=[JWT_ALGORITHM],
        )

        user_id = payload.get("sub")
        if not user_id:
            return None

        user = await get_user_by_id(user_id)

        if not user:
            return None

        if user.get("deleted_at"):
            return None

        if not user.get("is_active", True):
            return None

        return user

    except JWTError as e:
        print(f"JWT decode error: {e}")
        return None
    except Exception as e:
        print(f"Error in get_current_user_optional: {e}")
        return None


async def check_auth_middleware(request: Request) -> dict:
    """Middleware to check authentication and return user data"""
    try:
        token = request.cookies.get("user")

        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")

        try:
            payload = jwt.decode(
                token,
                PUBLIC_KEY,
                algorithms=[JWT_ALGORITHM],
            )
        except JWTError as e:
            print(f"JWT decode error: {e}")
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        user = await db.user.find_one(
            {"user_id": user_id, "deleted_at": None}, {"_id": 0}
        )

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user.get("is_locked"):
            raise HTTPException(
                status_code=403, detail="Account is locked. Please contact support."
            )

        if not user.get("is_active", True):
            raise HTTPException(
                status_code=403, detail="Account is inactive. Please contact support."
            )

        return user

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in check_auth_middleware: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(
            token,
            PUBLIC_KEY,
            algorithms=[JWT_ALGORITHM],
        )
        return payload
    except JWTError as e:
        print(f"Token verification failed: {e}")
        return None


async def check_token(request: Request):
    token = request.cookies.get("user")

    if not token:
        return

    try:
        jwt.decode(token, PUBLIC_KEY, algorithms=[JWT_ALGORITHM])
        raise HTTPException(status_code=400, detail="You are already logged in")

    except JWTError:
        return


def set_sharing_cookie(sharing_token: str, response: Response) -> None:
    payload = {
        "sub": sharing_token,
        "type": "sharing",
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(minutes=30),  # short lived
    }

    token = jwt.encode(payload, PRIVATE_KEY, algorithm=JWT_ALGORITHM)

    response.set_cookie(
        key="x-sharing-token",
        value=token,
        httponly=True,
        secure=is_prod,
        samesite="none" if is_prod else "lax",
        domain=".sharexpress.in" if is_prod else None,
        max_age=30 * 60,
        path="/",
    )
