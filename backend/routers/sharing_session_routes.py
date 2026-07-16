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
from fastapi import (
    APIRouter,
    Request,
    Body,
    Response,
    Depends,
    WebSocket,
    WebSocketDisconnect,
)
from controllers.share_controller import SharingController
from models.qr_model import QRVerifyRequest
from middlewares.sharing_token_middleware import verify_x_sharing_token
import json

from core.ws_manager import ws_manager
from core.database import get_db

db = get_db()

router = APIRouter(prefix="/share", tags=["share"])


@router.post("/create")
async def create_session(
    req: Request,
    response: Response,
    qr_token: QRVerifyRequest = Body(...),
):
    return await SharingController.create_session(req, qr_token, response)


@router.delete("/revoke")
async def revoke_session(res: Response, session=Depends(verify_x_sharing_token)):
    return await SharingController.terminate_session(session, res)


@router.get("/check")
async def check_session(session: dict = Depends(verify_x_sharing_token)):
    if session:
        return {
            "success": True,
            "mode": session["status"],
            "sender_name": session["sender_name"],
            "reciever_name": session["reciever_name"],
            "session_id": session["sharing_session_ID"],
        }

    return {"success": False, "message": "TOKEN EXPIRED OR NOT FOUND"}


@router.websocket("/ws/{qr_id}")
async def websocket_endpoint(websocket: WebSocket, qr_id: str):
    await ws_manager.connect(qr_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()

    except WebSocketDisconnect:
        ws_manager.disconnect(qr_id, websocket)
        print("❌ Disconnected:", qr_id)


@router.post("/connect")
async def connect_users(qr_token: QRVerifyRequest, req: Request):

    # 🔥 sender info
    sender_type, sender_id, sender_name = await SharingController.get_sender_info(req)

    # 🔥 receiver info
    (
        receiver_type,
        receiver_id,
        receiver_name,
    ) = await SharingController.get_reciever_details_by_token(qr_token)

    # 🔥 get qr_id
    qr = await db.qr_codes.find_one(
        {"qr_token": qr_token.qr_token},
        {"qr_id": 1, "_id": 0},
    )

    qr_id = qr["qr_id"]

    # 🔥 notify BOTH
    await ws_manager.send_to_room(
        qr_id,
        {
            "type": "CONNECTED",
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "sender_name": sender_name,
            "receiver_name": receiver_name,
        },
    )

    return {"success": True}
