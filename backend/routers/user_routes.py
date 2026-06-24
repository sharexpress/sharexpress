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
async def get_current_user(user=Depends(check_auth_middleware)):
    return await UserController.fetch_user(user)


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
