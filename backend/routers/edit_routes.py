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

from fastapi import APIRouter, Depends, Query, HTTPException
from middlewares.sharing_token_middleware import verify_x_sharing_token
from controllers.edit_controller import EditorController

router = APIRouter(prefix="/editor", tags=["Editor"])


@router.get("/load/{file_id}")
async def load_file(file_id: str, session=Depends(verify_x_sharing_token)):
    return await EditorController.load_file(file_id, session)


@router.get("/text/{file_id}/content")
async def get_text_content(file_id: str, session=Depends(verify_x_sharing_token)):
    return await EditorController.get_text_content(file_id, session)


@router.post("/text/{file_id}/save")
async def save_text_content(
    file_id: str, data: dict, session=Depends(verify_x_sharing_token)
):
    content = data.get("content")
    if content is None:
        raise HTTPException(status_code=400, detail="Missing content")
    return await EditorController.save_text_content(file_id, content, session)


@router.get("/{file_id}/versions")
async def get_version_history(file_id: str, session=Depends(verify_x_sharing_token)):
    return await EditorController.get_version_history(file_id, session)


@router.post("/{file_id}/rollback/{version_id}")
async def rollback_to_version(
    file_id: str, version_id: str, session=Depends(verify_x_sharing_token)
):
    return await EditorController.rollback_to_version(file_id, version_id, session)


@router.get("/docx/{file_id}/content")
async def get_docx_content(
    file_id: str,
    session=Depends(verify_x_sharing_token),
):
    return await EditorController.get_docx_content(file_id, session)


@router.post("/docx/{file_id}/save")
async def save_docx(
    file_id: str, data: dict, session=Depends(verify_x_sharing_token)
):
    content = data.get("content")
    if content is None:
        raise HTTPException(status_code=400, detail="Missing content")
    return await EditorController.save_docx(file_id, content, session)
