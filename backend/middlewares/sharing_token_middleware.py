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
from fastapi import HTTPException, Request, Response
from core.config import PUBLIC_KEY, JWT_ALGORITHM
from jose import jwt, JWTError
from core.database import get_db
from models.sharing_session_creation_model import Status
from controllers.share_controller import SharingController
from datetime import datetime, timedelta
from utils.JWT import set_sharing_cookie

db = get_db()


async def verify_x_sharing_token(req: Request, response: Response):
    try:
        token = req.cookies.get("x-sharing-token")

        if not token:
            raise HTTPException(
                status_code=400,
                detail="SHARING TOKEN NOT FOUND, SESSION CANNOT BE CREATED ",
            )

        try:
            payload = jwt.decode(
                token,
                PUBLIC_KEY,
                algorithms=[JWT_ALGORITHM],
            )
        except JWTError as e:
            print(f"JWT decode error: {e}")
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        sharing_token = payload.get("sub")

        if payload.get("type") != "sharing":
            raise HTTPException(status_code=403, detail="Invalid token type")

        sharing_session = await db.sharing_session.find_one(
            {"sharing_token": sharing_token, "is_active": True, "status": Status.ACTIVE}
        )

        if not sharing_session:
            raise HTTPException(
                status_code=403, detail="Invalid or expired sharing session"
            )

        # Check expiry
        expires_at = sharing_session.get("expires_at")
        if expires_at:
            # Force timezone naive comparison (assuming MongoDB stored as UTC naive)
            if expires_at.tzinfo is not None:
                expires_at = expires_at.replace(tzinfo=None)
            if expires_at < datetime.utcnow():
                await db.sharing_session.update_one(
                    {"sharing_token": sharing_token},
                    {"$set": {"status": Status.EXPIRED, "is_active": False, "updated_at": datetime.utcnow()}}
                )
                raise HTTPException(
                    status_code=403, detail="Sharing session has expired"
                )

        sender_type, sender_id, _ = await SharingController.get_sender_info(req)

        if not (
            (
                sharing_session["sender_ID"] == sender_id
                and sharing_session["sender_type"] == sender_type
            )
            or (
                sharing_session["receiver_ID"] == sender_id
                and sharing_session["receiver_type"] == sender_type
            )
        ):
            raise HTTPException(
                status_code=403, detail="Not authorized for this session"
            )

        # Extend sharing session TTL in DB (sliding window)
        new_expiry = datetime.utcnow() + timedelta(minutes=15)
        await db.sharing_session.update_one(
            {"sharing_token": sharing_token},
            {"$set": {"expires_at": new_expiry, "updated_at": datetime.utcnow()}}
        )

        # Extend the cookie age as well
        set_sharing_cookie(sharing_token, response)

        return sharing_session

    except HTTPException:
        raise
    except Exception as e:
        print(f"verify_x_sharing_token error: {e}")
        raise HTTPException(status_code=403, detail="SHARING TOKEN NOT VERIFIED ")
