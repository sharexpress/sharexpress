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
from fastapi import APIRouter, Response, Request, Depends
from models.user_model import User, OTPverify, email
from controllers.user_controller import UserController
from utils.JWT import check_auth_middleware, check_token
from models.user_profiles import updateUser
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/sendOTP")
async def send_otp(
    user: User,
    _: None = Depends(check_token),
):
    return await UserController.SendOTP(user)


@router.post("/verifyOTP")
async def verify_otp(
    payload: OTPverify,
    response: Response,
    request: Request,
    _: None = Depends(check_token),
):
    return await UserController.VerifyOTPControl(payload, response, request)


@router.get("/google/login")
async def google_login(request: Request):
    return await UserController.redirect_to_uri(request)


@router.patch("/update")
async def update_user(name: updateUser, user=Depends(check_auth_middleware)):
    return await UserController.update_user_name(user, name)


@router.get("/google/callback", name="google_callback")
async def google_callback(request: Request, response: Response):
    return await UserController.google_callback(request, response)


@router.post("/logout")
async def logout(response: Response, request: Request):
    return await UserController.Logout_user(response, request)


@router.get("/me")
async def get_current_user(request: Request, response: Response):
    from utils.JWT import get_current_user_optional
    user = await get_current_user_optional(request)
    if user:
        return await UserController.fetch_user(user)
    
    from utils.user_repo import get_or_create_guest_session
    try:
        session = await get_or_create_guest_session(request, response)
        if session:
            safe_user = {
                "user_id": session.get("session_id"),
                "user_name": session.get("guest_name"),
                "email": "guest@sharexpress.in",
                "picture": None,
                "auth_provider": "GUEST",
                "is_verified": False,
                "is_active": True,
                "is_guest": True,
                "created_at": session.get("created_at").isoformat() if isinstance(session.get("created_at"), datetime) else session.get("created_at"),
            }
            return {"success": True, "user": safe_user}
    except Exception as e:
        print(f"Error resolving guest in /me: {e}")
        
    return {"success": False, "user": None}


@router.get("/success")
async def auth_success():
    return {
        "success": True,
        "message": "Authentication successful",
        "redirect": "You can close this window or redirect to your app",
    }


@router.post("/search")
async def seach(email: email):
    return await UserController.search_by_email(email)


@router.delete("/activity-log")
async def delete_activity_log(user=Depends(check_auth_middleware)):
    from controllers.history_controller import HistoryController
    return await HistoryController.delete_activity_log(user)
