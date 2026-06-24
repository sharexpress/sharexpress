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
from models.sharing_session_creation_model import SharingSession, Status
from fastapi import Request, Response, HTTPException, Body
from core.database import get_db
from utils.JWT import get_current_user_optional
from models.qr_model import QRVerifyRequest
from utils.mongo_format_ import serialize_mongo
from enum import Enum
import secrets
from pymongo import ReturnDocument
from datetime import datetime, timedelta
from utils.JWT import set_sharing_cookie
from typing import Dict
from jose import jwt, JWTError
from core.config import JWT_ALGORITHM, JWT_SECRET, PUBLIC_KEY
from core.ws_manager import ws_manager

db = get_db()


class ParticipantsType(str, Enum):
    USER = "user"
    SESSION = "session"


class SharingController:
    @staticmethod
    async def get_sender_info(request: Request) -> tuple:
        """
        Get receiver information from request
        Returns: (receiver_type, receiver_id)
        """
        current_user = await get_current_user_optional(request)

        if current_user:
            sender_type = ParticipantsType.USER.value
            sender_id = current_user["user_id"]
            sender_name = current_user["name"]

        else:
            # Guest session
            sender_type = ParticipantsType.SESSION.value
            session_id = request.cookies.get("guest_session")

            name = await db.guest_sessions.find_one({"session_id": session_id})

            if not name:
                raise HTTPException(status_code=401, detail="Invalid guest session")

            sender_name = name.get("guest_name", "guest_user")

            if not session_id:
                raise HTTPException(
                    status_code=401, detail="No authentication or guest session found"
                )

            sender_id = session_id

        return (sender_type, sender_id, sender_name)

    @staticmethod
    async def get_reciever_details_by_token(qr_token: QRVerifyRequest):
        qr_token_t = qr_token.qr_token

        reciever_details = await db.qr_codes.find_one({"qr_token": qr_token_t})

        if not reciever_details:
            raise HTTPException(status_code=404, detail="QR NOT FOUND OR EXPIRED")

        owner_type = reciever_details["owner_type"]

        owner_id = reciever_details["owner_id"]

        owner = await db.user.find_one({"user_id": owner_id}, {"name": 1})

        user_values = [{"user_name": ""}]
        if owner_type == ParticipantsType.SESSION.value:
            reciever_type = ParticipantsType.SESSION.value
            reciever_id = reciever_details["owner_id"]
            reciever_name = reciever_details["owner_name"]

        elif owner_type == ParticipantsType.USER.value:
            reciever_type = ParticipantsType.USER.value
            reciever_id = reciever_details["owner_id"]
            reciever_name = owner["name"] if owner else reciever_details["owner_name"]

        else:
            raise HTTPException(status_code=400, detail="OWNER TYPE MUST BE DEFINED")

        return (reciever_type, reciever_id, reciever_name)

    @staticmethod
    async def create_session(
        req: Request, qr_token: QRVerifyRequest, response: Response
    ):

        try:
            (
                sender_type,
                sender_id,
                sender_name,
            ) = await SharingController.get_sender_info(req)

            (
                receiver_type,
                receiver_id,
                reciever_name,
            ) = await SharingController.get_reciever_details_by_token(qr_token)

            # Generate a NEW sharing token (rotation)
            new_sharing_token = secrets.token_urlsafe(48)

            set_sharing_cookie(new_sharing_token, response)
            # Try to UPDATE existing active session (token rotation)
            existing_session = await db.sharing_session.find_one_and_update(
                {
                    "qr_token": qr_token.qr_token,
                    "sender_type": sender_type,
                    "sender_ID": sender_id,
                    "sender_name": sender_name,
                    "receiver_ID": receiver_id,
                    "receiver_type": receiver_type,
                    "reciever_name": reciever_name,
                },
                {
                    "$set": {
                        "sharing_token": new_sharing_token,
                        "sender_type": sender_type,
                        "receiver_type": receiver_type,
                        "sender_name": sender_name,
                        "reciever_name": reciever_name,
                        "is_active": True,
                        "status": Status.ACTIVE,
                        "expires_at": datetime.utcnow() + timedelta(minutes=15),
                        "updated_at": datetime.utcnow(),
                    }
                },
                return_document=ReturnDocument.AFTER,
            )

            if existing_session:
                # ✅ Session existed → token rotated

                qr = await db.qr_codes.find_one(
                    {"qr_token": qr_token.qr_token},
                    {"qr_id": 1, "_id": 0},
                )

                qr_id = qr["qr_id"]

                await ws_manager.send_to_room(
                    qr_id,
                    {
                        "type": "CONNECTED",
                        "sender_name": sender_name,
                        "receiver_name": reciever_name,
                    },
                )

                return {
                    "success": True,
                    "mode": "rotated",
                    "sharing_token": new_sharing_token,
                    "session_id": existing_session["sharing_session_ID"],
                    "sender_name": sender_name,
                    "sender_type": sender_type,
                    "sender_ID": sender_id,
                    "receiver_ID": receiver_id,
                    "receiver_type": receiver_type,
                    "reciever_name": reciever_name,
                    "receiver_qr_token": qr_token.qr_token,
                }

            session_data = SharingSession(
                qr_token=qr_token.qr_token,
                sharing_token=new_sharing_token,
                sender_ID=sender_id,
                sender_type=ParticipantsType(sender_type),
                sender_name=sender_name,
                receiver_ID=receiver_id,
                receiver_type=ParticipantsType(receiver_type),
                reciever_name=reciever_name,
                status=Status.ACTIVE,
                is_active=True,
            )

            insert_session = await db.sharing_session.insert_one(
                session_data.model_dump()
            )

            qr = await db.qr_codes.find_one(
                {"qr_token": qr_token.qr_token},
                {"qr_id": 1, "_id": 0},
            )

            qr_id = qr["qr_id"]

            await ws_manager.send_to_room(
                qr_id,
                {
                    "type": "CONNECTED",
                    "sender_name": sender_name,
                    "receiver_name": reciever_name,
                },
            )

            return {
                "success": True,
                "mode": "created",
                "sharing_token": new_sharing_token,
                "session_id": session_data.sharing_session_ID,
                "sender_name": sender_name,
                "sender_type": sender_type,
                "sender_ID": sender_id,
                "receiver_ID": receiver_id,
                "receiver_type": receiver_type,
                "reciever_name": reciever_name,
                "receiver_qr_token": qr_token.qr_token,
            }

        except HTTPException:
            raise
        except Exception as e:
            print("create_session error:", e)
            raise HTTPException(status_code=500, detail="INTERNAL SERVER ERROR")

    @staticmethod
    async def terminate_session(sesson, res: Response):
        try:
            sharing_token = sesson["sharing_token"]

            await db.sharing_session.update_one(
                {
                    "sharing_token": sharing_token,
                    "is_active": True,
                },
                {
                    "$set": {
                        "is_active": False,
                        "status": Status.REVOKED,
                        "terminated_at": datetime.utcnow(),
                    }
                },
            )

            res.delete_cookie(
                key="x-sharing-token",
                httponly=True,
                samesite="lax",
                secure=False,
            )

            return {
                "success": True,
                "message": "Sharing session terminated successfully",
            }

        except HTTPException:
            raise
        except Exception as e:
            print("terminate_session error:", e)
            raise HTTPException(status_code=500, detail="INTERNAL SERVER ERROR")

    @staticmethod
    async def check_session(req: Request):
        try:
            check_token = req.cookies.get("x-sharing-token")

            if not check_token or check_token is None:
                raise HTTPException(status_code=404, detail="token not found")

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail="INTERNAL SERVER ERROR")
