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
from core.database import get_db
from fastapi import Request, Response
from datetime import datetime, timedelta
from uuid import uuid4
from utils.random_name_for_guest import get_random_names
from core.config import PROJECT_ENVIRONMENT

is_prod = PROJECT_ENVIRONMENT == "PRODUCTION"
db = get_db()


async def get_user_by_id(user_id: str):
    try:
        user = await db.user.find_one(
            {"user_id": user_id, "deleted_at": None}, {"_id": 0}
        )
        return user
    except Exception as e:
        print(f"Error in get_user_by_id: {e}")
        return None


async def get_user_by_email(email: str):
    try:
        user = await db.user.find_one({"email": email, "deleted_at": None}, {"_id": 0})
        return user
    except Exception as e:
        print(f"Error in get_user_by_email: {e}")
        return None


async def get_or_create_guest_session(request: Request, response: Response):
    try:
        session_id = request.cookies.get("guest_session")

        if session_id:
            session = await db.guest_sessions.find_one({"session_id": session_id})

            if session and session["expires_at"] > datetime.utcnow():
                new_expiry = datetime.utcnow() + timedelta(hours=24)

                await db.guest_sessions.update_one(
                    {"session_id": session_id},
                    {
                        "$set": {
                            "expires_at": new_expiry,
                            "updated_at": datetime.utcnow(),
                        }
                    },
                )

                session["expires_at"] = new_expiry
                return session

        session_id = str(uuid4())
        guest_name = get_random_names()
        expires_at = datetime.utcnow() + timedelta(hours=24)

        session_data = {
            "session_id": session_id,
            "guest_name": guest_name,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "expires_at": expires_at,
        }

        await db.guest_sessions.insert_one(session_data)

        response.set_cookie(
            key="guest_session",
            value=session_id,
            httponly=True,
            secure=is_prod,
            samesite="none" if is_prod else "lax",
            domain=".sharexpress.in" if is_prod else None,
            max_age=24 * 60 * 60,
            path="/",
        )

        return session_data

    except Exception as e:
        session_id = str(uuid4())
        guest_name = get_random_names()

        response.set_cookie(
            key="guest_session",
            value=session_id,
            httponly=True,
            secure=is_prod,
            samesite="none" if is_prod else "lax",
            domain=".sharexpress.in" if is_prod else None,
            max_age=24 * 60 * 60,
            path="/",
        )

        return {
            "session_id": session_id,
            "guest_name": guest_name,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(hours=24),
        }


async def cleanup_expired_sessions():
    try:
        result = await db.guest_sessions.delete_many(
            {"expires_at": {"$lt": datetime.utcnow()}}
        )
        print(f"Cleaned up {result.deleted_count} expired guest sessions")
        return result.deleted_count
    except Exception as e:
        print(f"Error in cleanup_expired_sessions: {e}")
        return 0


async def cleanup_expired_qr_codes():
    try:
        result = await db.qr_codes.update_many(
            {
                "expires_at": {"$lt": datetime.utcnow()},
                "is_active": True,
            },
            {"$set": {"is_active": False, "updated_at": datetime.utcnow()}},
        )
        print(f"Deactivated {result.modified_count} expired QR codes")
        return result.modified_count
    except Exception as e:
        print(f"Error in cleanup_expired_qr_codes: {e}")
        return 0
