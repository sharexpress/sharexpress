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
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from fastapi import APIRouter, Depends, HTTPException, Request, Query, status, Body
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
from utils.JWT import check_auth_middleware
from controllers.history_controller import HistoryController

from controllers.file_controller import (
    FileController,
    FileUploadError,
    ValidationError,
    StorageError,
    QuotaExceededError,
    File_User,
    sharing_files,
)
from middlewares.sharing_token_middleware import verify_x_sharing_token
from slowapi import Limiter
from slowapi.util import get_remote_address
from models.File_setup import (
    UploadInitRequest,
    UploadInitResponse,
    CompleteUploadResponse,
    CompleteUploadRequest,
    DownloadResponse,
    FileListResponse,
    MetricsResponse,
    HealthCheckResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/files", tags=["files"])

limiter = Limiter(key_func=get_remote_address)


@router.post(
    "/init-upload",
    response_model=UploadInitResponse,
    status_code=status.HTTP_200_OK,
)
@limiter.limit("20/minute")
async def init_upload(
    request: Request,
    payload: UploadInitRequest,
    session: Dict[str, Any] = Depends(verify_x_sharing_token),
):
    """Initialize file upload with presigned URLs"""
    try:
        controller = FileController()

        logger.info(
            f"Init upload request: session={session.get('sharing_session_ID')}, "
            f"files={len(payload.files)}"
        )

        result = await controller.init_upload(files=payload.files, session=session)

        return JSONResponse(status_code=status.HTTP_200_OK, content=result)

    except ValidationError as e:
        logger.warning(f"Validation error in init_upload: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    except QuotaExceededError as e:
        logger.warning(f"Quota exceeded: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Unexpected error in init_upload: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize upload",
        )


@router.post(
    "/complete-upload",
    response_model=CompleteUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def complete_upload(
    request: Request,
    payload: CompleteUploadRequest,
    session: Dict[str, Any] = Depends(verify_x_sharing_token),
):
    try:
        controller = FileController()

        logger.info(
            f"Complete upload request: session={session.get('sharing_session_ID')}, "
            f"files={len(payload.files)}"
        )

        files_as_dict = [f.model_dump() for f in payload.files]

        result = await controller.complete_upload(files_as_dict, session)

        return JSONResponse(status_code=status.HTTP_201_CREATED, content=result)

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Unexpected error in complete_upload: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete upload",
        )


@router.get(
    "/download/{file_id}",
    response_model=DownloadResponse,
    status_code=status.HTTP_200_OK,
)
async def download_file(file_id: str, user: dict = Depends(check_auth_middleware)):
    """Generate presigned download URL"""
    try:
        controller = FileController()

        logger.info(f"Download request: file_id={file_id}, ")

        result = await controller.generate_download_url(
            user,
            file_id=file_id,
        )

        return JSONResponse(status_code=status.HTTP_200_OK, content=result)

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Unexpected error in download_file: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate download URL",
        )


@router.get(
    "/session/{session_id}/list",
    response_model=FileListResponse,
    status_code=status.HTTP_200_OK,
)
async def list_session_files(
    session_id: str,
    request: Request,
    include_deleted: bool = Query(default=False, description="Include deleted files"),
    session: Dict[str, Any] = Depends(verify_x_sharing_token),
):
    try:
        controller = FileController()

        result = await controller.list_session_files_user(
            session_id=session_id,
            request=request,
            include_deleted=include_deleted,
            session=session,
        )

        return JSONResponse(status_code=status.HTTP_200_OK, content=result)

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Unexpected error in list_session_files: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list files",
        )


@router.delete(
    "/{file_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_file(
    file_id: str,
    permanent: bool = Query(default=False, description="Permanently delete from S3"),
    session: Dict[str, Any] = Depends(verify_x_sharing_token),
):
    try:
        controller = FileController()

        # Get file document
        file_doc = await controller.db.files.find_one(
            {"file_id": file_id, "sharing_session_id": session["sharing_session_ID"]}
        )

        if not file_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="File not found"
            )

        # Check if user is sender
        if file_doc["sender_ID"] != session["sender_ID"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only file sender can delete files",
            )

        if permanent:
            # Permanent delete: remove from S3
            await controller._cleanup_storage(file_doc["storage_key"])
            logger.info(f"Permanently deleted file {file_id} from S3")

        # Update database (soft delete)
        await controller.db.files.update_one(
            {"file_id": file_id},
            {"$set": {"is_deleted": True, "deleted_at": datetime.utcnow()}},
        )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "file_id": file_id,
                "deleted": True,
                "permanent": permanent,
            },
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Unexpected error in delete_file: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete file",
        )


@router.get(
    "/metrics",
    response_model=MetricsResponse,
)
async def get_metrics():
    """Get upload metrics"""
    try:
        controller = FileController()
        metrics = await controller.get_metrics()

        return JSONResponse(status_code=status.HTTP_200_OK, content=metrics)

    except Exception as e:
        logger.error(f"Error retrieving metrics: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve metrics",
        )


@router.get(
    "/system-health",
    response_model=HealthCheckResponse,
    status_code=status.HTTP_200_OK,
)
async def system_health():
    """System health check"""
    try:
        controller = FileController()
        health = await controller.health_check()

        status_code = (
            status.HTTP_200_OK
            if health["status"] == "healthy"
            else status.HTTP_503_SERVICE_UNAVAILABLE
        )

        return JSONResponse(status_code=status_code, content=health)

    except Exception as e:
        logger.error(f"Health check failed: {e}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "error",
                "database": "unknown",
                "storage": "unknown",
                "circuit_breaker_state": "unknown",
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e),
            },
        )


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Basic health check",
    description="Simple endpoint returning 200 OK to verify service is running.",
)
async def basic_health():
    """Basic health check endpoint"""
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "success": True,
            "message": "File service operational",
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


@router.get(
    "/debug/bucket",
    status_code=status.HTTP_200_OK,
    include_in_schema=True,
)
async def debug_bucket_contents(
    prefix: str = Query(default="", description="Filter by key prefix"),
):
    """Debug endpoint to list bucket contents"""
    try:
        controller = FileController()
        result = await controller.debug_bucket_contents(prefix=prefix)

        return JSONResponse(status_code=status.HTTP_200_OK, content=result)

    except Exception as e:
        logger.error(f"Debug bucket contents failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.post(
    "/cleanup/expired",
    status_code=status.HTTP_200_OK,
    include_in_schema=True,
)
async def trigger_cleanup():
    """Manually trigger file cleanup"""
    try:
        controller = FileController()
        from controllers.file_controller import BackgroundCleaner

        cleaner = BackgroundCleaner(controller)
        await cleaner.cleanup_expired_files()

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "message": "Cleanup completed",
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

    except Exception as e:
        logger.error(f"Manual cleanup failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Cleanup failed"
        )


@router.get("/admin-analytics")
async def get_admin_analytics(user: dict = Depends(check_auth_middleware)):
    """Expose administrative analytics for system health monitoring (LOG-06)"""
    email_str = user.get("email", "")
    if email_str not in ["noreply@sharexpress.in", "admin@sharexpress.in"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Admin credentials required",
        )
    controller = FileController()
    return await controller.get_admin_analytics()


@router.get("/user/files")
async def get_files(user: dict = Depends(check_auth_middleware)):
    return await File_User.get_files_uploaded_by_users(user)


@router.delete("/user/files")
async def delete_hard(user: dict = Depends(check_auth_middleware)):
    return await File_User.delete_all_files_hard(user)


@router.post("/share")
async def share_files(
    data: dict = Body(...),
    user=Depends(check_auth_middleware),
):
    qr_token = data.get("qr_token")
    file_ids = data.get("file_ids")

    if not qr_token or not file_ids:
        return {"success": False, "message": "Missing data"}

    # ✅ STEP 1: Share files
    result = await sharing_files.share_files_between_client(
        qr_token=qr_token,
        selected_file_ids=file_ids,
        sender=user,
    )

    session = result.get("session")
    files = result.get("files")

    # ✅ STEP 2: Create history
    if session and files:
        await HistoryController.create_History(session=session, files=files)

    return result
