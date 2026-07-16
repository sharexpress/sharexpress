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
import asyncio
import os
import hashlib
import logging
from uuid import uuid4
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from collections import defaultdict
from contextlib import asynccontextmanager
from functools import wraps
import time
from fastapi.responses import JSONResponse
from fastapi import HTTPException
from botocore.exceptions import ClientError, BotoCoreError
import magic  # python-magic for real mime detection
from core.database import get_db
from core.s3_config import (
    s3_client,
    s3_internal,
    s3_public,
    generate_presigned_upload_url,
)
from core.config import MINIO_BUCKET
from core.permission_engine import PermissionEngine
from models.history_model import UserMeta, FileMeta, TransferHistory

from bson import ObjectId
from datetime import datetime

logger = logging.getLogger(__name__)


class FileUploadError(Exception):
    """Base exception for file upload errors"""

    pass


class ValidationError(FileUploadError):
    """Validation failed"""

    pass


class StorageError(FileUploadError):
    """Storage operation failed"""

    pass


class QuotaExceededError(FileUploadError):
    """User quota exceeded"""

    pass


class CircuitBreaker:
    """Circuit breaker for external service calls"""

    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
        expected_exception: type = Exception,
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "closed"
        self._lock = asyncio.Lock()

    async def call(self, func, *args, **kwargs):
        async with self._lock:
            if self.state == "open":
                if time.time() - self.last_failure_time > self.recovery_timeout:
                    self.state = "half-open"
                    logger.info("Circuit breaker entering half-open state")
                else:
                    raise StorageError("Circuit breaker is open - service unavailable")

        try:
            result = await func(*args, **kwargs)
            async with self._lock:
                if self.state == "half-open":
                    self.state = "closed"
                    self.failure_count = 0
                    logger.info("Circuit breaker closed - service recovered")
            return result
        except self.expected_exception as e:
            async with self._lock:
                self.failure_count += 1
                self.last_failure_time = time.time()

                if self.failure_count >= self.failure_threshold:
                    self.state = "open"
                    logger.error(
                        f"Circuit breaker opened after {self.failure_count} failures"
                    )
                raise StorageError(f"Storage operation failed: {str(e)}")


def async_retry(
    max_attempts: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: tuple = (Exception,),
):
    """Retry decorator with exponential backoff"""

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            attempt = 0
            current_delay = delay

            while attempt < max_attempts:
                try:
                    return await func(*args, **kwargs)
                except exceptions as e:
                    attempt += 1
                    if attempt >= max_attempts:
                        logger.error(
                            f"Function {func.__name__} failed after {max_attempts} attempts: {e}"
                        )
                        raise

                    logger.warning(
                        f"Attempt {attempt}/{max_attempts} failed for {func.__name__}: {e}. "
                        f"Retrying in {current_delay}s..."
                    )
                    await asyncio.sleep(current_delay)
                    current_delay *= backoff

        return wrapper

    return decorator


class RateLimiter:
    def __init__(self, rate: int, per: int):
        self.rate = rate
        self.per = per
        self.allowance = defaultdict(lambda: rate)
        self.last_check = defaultdict(lambda: time.time())
        self._lock = asyncio.Lock()

    async def acquire(self, key: str) -> bool:
        async with self._lock:
            current = time.time()
            time_passed = current - self.last_check[key]
            self.last_check[key] = current

            self.allowance[key] += time_passed * (self.rate / self.per)
            if self.allowance[key] > self.rate:
                self.allowance[key] = self.rate

            if self.allowance[key] < 1.0:
                return False

            self.allowance[key] -= 1.0
            return True


class MetricsCollector:
    def __init__(self):
        self.upload_counter = 0
        self.upload_bytes = 0
        self.error_counter = 0
        self.upload_durations = []
        self._lock = asyncio.Lock()

    async def record_upload(self, bytes_size: int, duration: float):
        async with self._lock:
            self.upload_counter += 1
            self.upload_bytes += bytes_size
            self.upload_durations.append(duration)

            if len(self.upload_durations) > 1000:
                self.upload_durations = self.upload_durations[-1000:]

    async def record_error(self):
        async with self._lock:
            self.error_counter += 1

    async def get_stats(self) -> Dict[str, Any]:
        async with self._lock:
            avg_duration = (
                sum(self.upload_durations) / len(self.upload_durations)
                if self.upload_durations
                else 0
            )
            return {
                "total_uploads": self.upload_counter,
                "total_bytes": self.upload_bytes,
                "total_errors": self.error_counter,
                "avg_upload_duration": avg_duration,
                "success_rate": (
                    (self.upload_counter / (self.upload_counter + self.error_counter))
                    if (self.upload_counter + self.error_counter) > 0
                    else 0
                ),
            }


class FileValidator:
    DANGEROUS_EXTENSIONS = {
        ".exe",
        ".bat",
        ".cmd",
        ".com",
        ".pif",
        ".scr",
        ".vbs",
        ".js",
        ".jar",
        ".app",
        ".deb",
        ".rpm",
        ".dmg",
        ".pkg",
        ".sh",
        ".bash",
    }

    ALLOWED_MIME_TYPES = {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain",
        "text/csv",
        "text/html",
        "text/markdown",
        "application/json",
        "application/xml",
        # Images
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "image/bmp",
        "image/tiff",
        # Audio
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/webm",
        "audio/aac",
        # Video
        "video/mp4",
        "video/mpeg",
        "video/webm",
        "video/ogg",
        "video/quicktime",
        # Archives
        "application/zip",
        "application/x-rar-compressed",
        "application/x-7z-compressed",
        "application/gzip",
        "application/x-tar",
    }

    @staticmethod
    def validate_filename(filename: str) -> str:
        """Sanitize and validate filename"""
        safe_name = os.path.basename(filename)

        safe_name = "".join(char for char in safe_name if ord(char) >= 32)

        if len(safe_name) > 255:
            name, ext = os.path.splitext(safe_name)
            safe_name = name[:250] + ext

        ext = os.path.splitext(safe_name)[1].lower()
        if ext in FileValidator.DANGEROUS_EXTENSIONS:
            raise ValidationError(f"File type {ext} not allowed for security reasons")

        if not safe_name or safe_name == ".":
            raise ValidationError("Invalid filename")

        return safe_name

    @staticmethod
    async def validate_mime_type(file_content: bytes, declared_mime: str) -> str:
        """Validate MIME type using actual file content"""
        try:
            detected_mime = magic.from_buffer(file_content[:2048], mime=True)

            if detected_mime not in FileValidator.ALLOWED_MIME_TYPES:
                raise ValidationError(f"File type {detected_mime} not allowed")

            if detected_mime != declared_mime:
                logger.warning(
                    f"MIME type mismatch: declared={declared_mime}, "
                    f"detected={detected_mime}"
                )

            return detected_mime
        except Exception as e:
            logger.error(f"MIME type detection failed: {e}")
            raise ValidationError("Could not verify file type")

    @staticmethod
    def calculate_checksum(content: bytes) -> str:
        """Calculate SHA-256 checksum for file integrity"""
        return hashlib.sha256(content).hexdigest()


class QuotaManager:
    """Manage user upload quotas"""

    def __init__(self, db):
        self.db = db
        self._cache_ttl = 300

    async def check_quota(self, user_id: str, session_id: str, size: int) -> bool:
        """Check if user has enough quota"""
        DAILY_QUOTA = 1024 * 1024 * 1024
        from lib.redis import Redis_client

        cache_key = f"quota:{user_id}:{session_id}"
        cached_val = await asyncio.to_thread(Redis_client.get, cache_key)

        if cached_val is not None:
            current_usage = int(cached_val)
        else:
            current_usage = await self._get_usage_from_db(user_id, session_id)
            await asyncio.to_thread(Redis_client.setex, cache_key, self._cache_ttl, str(current_usage))

        if current_usage + size > DAILY_QUOTA:
            raise QuotaExceededError(
                f"Daily quota exceeded. Used: {current_usage / 1024 / 1024:.2f}MB, "
                f"Limit: {DAILY_QUOTA / 1024 / 1024:.2f}MB"
            )

        return True

    async def _get_usage_from_db(self, user_id: str, session_id: str) -> int:
        """Get current usage from database"""
        start_of_day = datetime.utcnow().replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        result = await self.db.files.aggregate(
            [
                {
                    "$match": {
                        "sender_ID": user_id,
                        "sharing_session_id": session_id,
                        "created_at": {"$gte": start_of_day},
                        "is_deleted": False,
                    }
                },
                {"$group": {"_id": None, "total": {"$sum": "$size"}}},
            ]
        ).to_list(length=1)

        return result[0]["total"] if result else 0

    async def increment_usage(self, user_id: str, session_id: str, size: int):
        """Increment cached usage"""
        from lib.redis import Redis_client
        cache_key = f"quota:{user_id}:{session_id}"
        exists = await asyncio.to_thread(Redis_client.exists, cache_key)
        if exists:
            await asyncio.to_thread(Redis_client.incrby, cache_key, size)


"""FILE CONTROLLER STARTS FROM HERE """


class FileController:
    """Production-grade file sharing controller"""

    MAX_FILE_SIZE = 20 * 1024 * 1024
    MAX_FILES_PER_REQUEST = 30
    PARALLEL_LIMIT = 10
    CHUNK_SIZE = 5 * 1024 * 1024

    UPLOAD_SEMAPHORE = asyncio.Semaphore(PARALLEL_LIMIT)

    # Shared instances
    circuit_breaker = CircuitBreaker(
        failure_threshold=5,
        recovery_timeout=60,
        expected_exception=(ClientError, BotoCoreError),
    )
    rate_limiter = RateLimiter(rate=100, per=60)
    metrics = MetricsCollector()

    def __init__(self):
        self.db = get_db()
        self.quota_manager = QuotaManager(self.db)

    async def validate_batch(self, files: List[Any], session: Dict[str, Any]) -> None:
        """Comprehensive batch validation"""
        start_time = time.time()

        try:
            rate_key = f"{session['sender_ID']}:{session['sharing_session_ID']}"
            if not await self.rate_limiter.acquire(rate_key):
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded. Please wait before uploading more files.",
                )

            if len(files) > self.MAX_FILES_PER_REQUEST:
                raise ValidationError(
                    f"Maximum {self.MAX_FILES_PER_REQUEST} files allowed per request"
                )

            if not files:
                raise ValidationError("No files provided")

            total_size = sum(f.size for f in files)
            max_batch_size = self.MAX_FILE_SIZE * self.MAX_FILES_PER_REQUEST

            if total_size > max_batch_size:
                raise ValidationError(
                    f"Total batch size {total_size / 1024 / 1024:.2f}MB exceeds "
                    f"limit of {max_batch_size / 1024 / 1024:.2f}MB"
                )

            await self.quota_manager.check_quota(
                user_id=session["sender_ID"],
                session_id=session["sharing_session_ID"],
                size=total_size,
            )

            # Validate individual files
            validation_tasks = [self._validate_single_file(f) for f in files]
            await asyncio.gather(*validation_tasks)

            logger.info(
                f"Batch validation completed in {time.time() - start_time:.2f}s. "
                f"Files: {len(files)}, Total size: {total_size / 1024 / 1024:.2f}MB"
            )

        except (ValidationError, QuotaExceededError) as e:
            await self.metrics.record_error()
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            await self.metrics.record_error()
            logger.error(f"Batch validation failed: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Validation failed")

    async def _validate_single_file(self, file_data: Any) -> None:
        """Validate a single file"""
        # Validate size
        if file_data.size > self.MAX_FILE_SIZE:
            raise ValidationError(
                f"{file_data.filename} exceeds {self.MAX_FILE_SIZE / 1024 / 1024}MB limit"
            )

        if file_data.size == 0:
            raise ValidationError(f"{file_data.filename} is empty")

        # Validate filename
        try:
            FileValidator.validate_filename(file_data.filename)
        except ValidationError as e:
            raise ValidationError(f"Invalid filename '{file_data.filename}': {e}")

    async def init_upload(
        self, files: List[Any], session: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Initialize upload with presigned URLs"""
        start_time = time.time()

        try:
            # Validate session
            if not session or not session.get("sharing_session_ID"):
                raise HTTPException(status_code=401, detail="Invalid session")

            await self.validate_batch(files, session)

            sharing_session_id = session["sharing_session_ID"]

            tasks = [self._generate_presigned_url(f, sharing_session_id) for f in files]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            successful_results = []
            errors = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    errors.append(f"File {files[i].filename}: {str(result)}")
                    await self.metrics.record_error()
                else:
                    successful_results.append(result)

            if errors:
                logger.error(f"Errors during URL generation: {errors}")
                if not successful_results:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to generate upload URLs: {'; '.join(errors)}",
                    )

            duration = time.time() - start_time
            logger.info(
                f"Upload initialization completed in {duration:.2f}s. "
                f"Successful: {len(successful_results)}, Errors: {len(errors)}"
            )

            return {
                "files": successful_results,
                "errors": errors if errors else None,
                "expires_in": 600,
            }

        except HTTPException:
            raise
        except Exception as e:
            await self.metrics.record_error()
            logger.error(f"Upload initialization failed: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Failed to initialize upload")

    @async_retry(max_attempts=3, delay=0.5, exceptions=(ClientError, BotoCoreError))
    async def _generate_presigned_url(
        self, file_data: Any, sharing_session_id: str
    ) -> Dict[str, Any]:
        """Generate presigned URL for file upload with circuit breaker"""
        async with self.UPLOAD_SEMAPHORE:

            async def _generate():
                file_id = str(uuid4())
                safe_name = FileValidator.validate_filename(file_data.filename)
                object_key = f"{sharing_session_id}/{file_id}_{safe_name}"

                loop = asyncio.get_event_loop()
                url = await loop.run_in_executor(
                    None,
                    generate_presigned_upload_url,
                    object_key,
                    file_data.content_type,
                )

                return {
                    "file_id": file_id,
                    "filename": safe_name,
                    "storage_key": object_key,
                    "upload_url": url,
                    "size": file_data.size,
                    "content_type": file_data.content_type,
                }

            return await self.circuit_breaker.call(_generate)

    async def complete_upload(
        self, files: List[Dict[str, Any]], session: Dict[str, Any]
    ) -> Dict[str, Any]:
        start_time = time.time()

        try:
            if not session or not session.get("sharing_session_ID"):
                raise HTTPException(status_code=401, detail="Invalid session")

            if not files:
                raise HTTPException(status_code=400, detail="No files provided")

            verification_tasks = [
                self._verify_and_prepare_document(f, session) for f in files
            ]
            results = await asyncio.gather(*verification_tasks, return_exceptions=True)

            successful_docs = []
            failed_files = []
            total_size = 0

            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    failed_files.append(
                        {"file_id": files[i].get("file_id"), "error": str(result)}
                    )
                    await self.metrics.record_error()
                else:
                    successful_docs.append(result)
                    total_size += result["size"]

            saved_count = 0
            if successful_docs:
                try:
                    saved_count = await self._save_documents_batch(successful_docs)

                    await self.quota_manager.increment_usage(
                        user_id=session["sender_ID"],
                        session_id=session["sharing_session_ID"],
                        size=total_size,
                    )

                    duration = time.time() - start_time
                    await self.metrics.record_upload(total_size, duration)

                except Exception as e:
                    logger.error(f"Database save failed: {e}", exc_info=True)
                    cleanup_tasks = [
                        self._cleanup_storage(doc["storage_key"])
                        for doc in successful_docs
                    ]
                    await asyncio.gather(*cleanup_tasks, return_exceptions=True)
                    raise HTTPException(
                        status_code=500, detail="Failed to save file metadata"
                    )

            duration = time.time() - start_time
            logger.info(
                f"Upload completion finished in {duration:.2f}s. "
                f"Saved: {saved_count}, Failed: {len(failed_files)}, "
                f"Total size: {total_size / 1024 / 1024:.2f}MB"
            )

            response = {
                "success": True,
                "files_saved": saved_count,
                "total_size": total_size,
            }

            if failed_files:
                response["failed_files"] = failed_files

            print("complete upload response = ", response)

            return response

        except HTTPException:
            raise
        except Exception as e:
            await self.metrics.record_error()
            logger.error(f"Upload completion failed: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Failed to complete upload")

    @async_retry(max_attempts=3, delay=0.5, exceptions=(ClientError, BotoCoreError))
    async def _verify_and_prepare_document(
        self, file_info: Dict[str, Any], session: Dict[str, Any]
    ) -> Dict[str, Any]:

        async def _verify():
            loop = asyncio.get_event_loop()
            try:
                metadata = await loop.run_in_executor(
                    None,
                    lambda: s3_internal.head_object(
                        Bucket=MINIO_BUCKET,
                        Key=file_info["storage_key"],
                    ),
                )
            except ClientError as e:
                if e.response["Error"]["Code"] == "404":
                    raise StorageError(
                        f"File {file_info['storage_key']} not found in storage"
                    )
                raise

            # Extract metadata
            actual_size = metadata.get("ContentLength", file_info.get("size", 0))
            etag = metadata.get("ETag", "").strip('"')

            return {
                "file_id": file_info["file_id"],
                "sharing_session_id": session["sharing_session_ID"],
                "sender_ID": session["sender_ID"],
                "sender_type": session["sender_type"],
                "storage_key": file_info["storage_key"],
                "size": actual_size,
                "mime_type": file_info.get("content_type"),
                "filename": file_info.get("filename"),
                "etag": etag,
                "is_deleted": False,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }

        return await self.circuit_breaker.call(_verify)

    async def _save_documents_batch(self, docs: List[Dict[str, Any]]) -> int:
        """Save documents to database with batching"""
        if not docs:
            return 0

        BATCH_SIZE = 100
        saved_count = 0

        for i in range(0, len(docs), BATCH_SIZE):
            batch = docs[i : i + BATCH_SIZE]
            try:
                result = await self.db.files.insert_many(
                    batch,
                    ordered=False,
                )
                saved_count += len(result.inserted_ids)
                ""
            except Exception as e:
                logger.error(f"Batch insert failed: {e}", exc_info=True)
                # Try to save individually
                for doc in batch:
                    try:
                        await self.db.files.insert_one(doc)
                        saved_count += 1
                    except Exception as inner_e:
                        logger.error(
                            f"Failed to save document {doc['file_id']}: {inner_e}"
                        )

        return saved_count

    @async_retry(max_attempts=2, delay=1.0, exceptions=(ClientError, BotoCoreError))
    async def _cleanup_storage(self, storage_key: str) -> None:
        """Cleanup file from storage"""
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: s3_internal.delete_object(Bucket=MINIO_BUCKET, Key=storage_key),
            )
            logger.info(f"Cleaned up storage key: {storage_key}")
        except Exception as e:
            logger.error(f"Failed to cleanup {storage_key}: {e}")
            # Don't raise - cleanup is best effort

    async def get_metrics(self) -> Dict[str, Any]:
        """Get system metrics"""
        return await self.metrics.get_stats()

    async def health_check(self) -> Dict[str, Any]:
        """Health check endpoint"""
        try:
            # Check database
            await self.db.files.find_one()
            db_healthy = True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            db_healthy = False

        try:
            # Check S3
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: s3_internal.list_objects_v2(Bucket=MINIO_BUCKET, MaxKeys=1),
            )
            s3_healthy = True
        except Exception as e:
            logger.error(f"S3 health check failed: {e}")
            s3_healthy = False

        return {
            "status": "healthy" if (db_healthy and s3_healthy) else "degraded",
            "database": "healthy" if db_healthy else "unhealthy",
            "storage": "healthy" if s3_healthy else "unhealthy",
            "circuit_breaker_state": self.circuit_breaker.state,
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def list_session_files_user(
        self,
        session_id,
        request,
        include_deleted,
        session,
    ):
        try:
            if session.get("sharing_session_ID") != session_id:
                raise HTTPException(
                    status_code=403,
                    detail="Not authorized to access this session's files",
                )

            logger.info(f"List files request: session={session_id}")

            query = {"sharing_session_id": session_id}
            if not include_deleted:
                query["is_deleted"] = False

            files = (
                await self.db.files.find(query, {"_id": 0})
                .sort("created_at", -1)
                .to_list(length=1000)
            )

            total_size = sum(f.get("size", 0) for f in files)

            for f in files:
                if f.get("created_at"):
                    f["created_at"] = f["created_at"].isoformat()
                if f.get("updated_at"):
                    f["updated_at"] = f["updated_at"].isoformat()

            return {
                "success": True,
                "files": files,
                "total_count": len(files),
                "total_size": total_size,
                "total_size_human": f"{total_size / 1024 / 1024:.2f} MB",
            }

        except HTTPException:
            raise

        except Exception as e:
            logger.error(f"Error listing files: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Failed to list files")

    @async_retry(max_attempts=3, delay=0.5, exceptions=(ClientError, BotoCoreError))
    async def generate_download_url(self, user, file_id: str) -> Dict[str, Any]:
        """Generate secure presigned download URL"""
        return await self.generate_download_url_v2(user, None, file_id)

    @async_retry(max_attempts=3, delay=0.5, exceptions=(ClientError, BotoCoreError))
    async def generate_download_url_v2(self, user, session, file_id: str) -> Dict[str, Any]:
        """Generate secure presigned download URL for both user and session flows"""
        query = {"file_id": file_id, "is_deleted": False}
        if user:
            query["sender_ID"] = user["user_id"]
        elif session:
            query["sharing_session_id"] = session["sharing_session_ID"]
        else:
            raise HTTPException(status_code=401, detail="Unauthorized")

        file_doc = await self.db.files.find_one(query)
        if not file_doc:
            raise HTTPException(status_code=404, detail="File not found")

        storage_key = file_doc["storage_key"]

        # 3️⃣ Generate presigned GET URL (run sync in executor)
        loop = asyncio.get_event_loop()

        def _generate():
            return s3_public.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": MINIO_BUCKET,
                    "Key": storage_key,
                    "ResponseContentDisposition": "inline",
                },
                ExpiresIn=600,
            )

        try:

            async def wrapped():
                return await loop.run_in_executor(None, _generate)

            download_url = await self.circuit_breaker.call(wrapped)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

        return {
            "file_id": file_id,
            "filename": file_doc["filename"],
            "download_url": download_url,
            "expires_in": 600,
        }

    async def debug_bucket_contents(self, prefix: str = ""):
        try:
            loop = asyncio.get_event_loop()

            def _list():
                return s3_internal.list_objects_v2(
                    Bucket=MINIO_BUCKET, Prefix=prefix, MaxKeys=100
                )

            response = await loop.run_in_executor(None, _list)

            objects = []
            for obj in response.get("Contents", []):
                objects.append(
                    {
                        "key": obj["Key"],
                        "size": obj["Size"],
                        "last_modified": obj["LastModified"].isoformat(),
                        "etag": obj["ETag"].strip('"'),
                    }
                )

            return {
                "success": True,
                "bucket": MINIO_BUCKET,
                "count": len(objects),
                "objects": objects,
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def get_admin_analytics(self) -> Dict[str, Any]:
        """Aggregate stats for administrator analytics dashboard"""
        try:
            # 1. Active sessions counts
            active_sharing_sessions = await self.db.sharing_session.count_documents({"is_active": True})
            active_guest_sessions = await self.db.guest_sessions.count_documents({"expires_at": {"$gt": datetime.utcnow()}})

            # 2. File counts & storage usage
            total_files = await self.db.files.count_documents({"is_deleted": False})
            
            # Aggregate storage size
            pipeline = [
                {"$match": {"is_deleted": False}},
                {"$group": {"_id": None, "total_size": {"$sum": "$size"}}}
            ]
            cursor = self.db.files.aggregate(pipeline)
            res = await cursor.to_list(length=1)
            total_storage_bytes = res[0]["total_size"] if res else 0

            # 3. Upload statuses (counts for pending, uploaded, failed)
            uploaded_count = await self.db.files.count_documents({"upload_status": "uploaded", "is_deleted": False})
            failed_count = await self.db.files.count_documents({"upload_status": "failed", "is_deleted": False})
            pending_count = await self.db.files.count_documents({"upload_status": "pending", "is_deleted": False})

            # Calculate error rate
            total_attempts = uploaded_count + failed_count
            error_rate = (failed_count / total_attempts * 100) if total_attempts > 0 else 0.0

            # 4. System stats
            return {
                "success": True,
                "timestamp": datetime.utcnow().isoformat(),
                "active_sessions": {
                    "sharing": active_sharing_sessions,
                    "guest": active_guest_sessions,
                    "total": active_sharing_sessions + active_guest_sessions
                },
                "storage": {
                    "total_files": total_files,
                    "total_bytes": total_storage_bytes,
                    "total_mb": round(total_storage_bytes / 1024 / 1024, 2),
                },
                "uploads": {
                    "uploaded": uploaded_count,
                    "failed": failed_count,
                    "pending": pending_count,
                    "error_rate_percent": round(error_rate, 2)
                }
            }
        except Exception as e:
            logger.error(f"Error gathering admin analytics: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Failed to gather admin analytics: {str(e)}")


"""FILE CONTROLLER ENDS HERE """


class BackgroundCleaner:
    """Background task to cleanup expired/orphaned files"""

    def __init__(self, file_controller: FileController):
        self.controller = file_controller
        self.running = False

    async def start(self):
        """Start background cleanup task"""
        self.running = True
        while self.running:
            try:
                await self.cleanup_expired_files()
                await self.cleanup_expired_sessions_and_qrs()
                await asyncio.sleep(3600)
            except Exception as e:
                logger.error(f"Background cleanup error: {e}", exc_info=True)
                await asyncio.sleep(60)

    async def cleanup_expired_files(self):
        """Cleanup files older than retention period"""
        RETENTION_DAYS = 30
        cutoff_date = datetime.utcnow() - timedelta(days=RETENTION_DAYS)

        expired_files = await self.controller.db.files.find(
            {"created_at": {"$lt": cutoff_date}, "is_deleted": False}
        ).to_list(length=1000)

        if not expired_files:
            return

        logger.info(f"Cleaning up {len(expired_files)} expired files")

        cleanup_tasks = [
            self.controller._cleanup_storage(f["storage_key"]) for f in expired_files
        ]
        await asyncio.gather(*cleanup_tasks, return_exceptions=True)

        file_ids = [f["file_id"] for f in expired_files]
        await self.controller.db.files.update_many(
            {"file_id": {"$in": file_ids}},
            {"$set": {"is_deleted": True, "deleted_at": datetime.utcnow()}},
        )

        logger.info(f"Cleanup completed for {len(expired_files)} files")

    async def cleanup_expired_sessions_and_qrs(self):
        try:
            from utils.user_repo import cleanup_expired_sessions, cleanup_expired_qr_codes
            deleted_sessions = await cleanup_expired_sessions()
            deactivated_qrs = await cleanup_expired_qr_codes()
            logger.info(f"Cleaned up {deleted_sessions} expired sessions and deactivated {deactivated_qrs} expired QR codes")
        except Exception as e:
            logger.error(f"Failed to cleanup expired sessions or QR codes: {e}")

    def stop(self):
        """Stop background cleanup task"""
        self.running = False


class File_User:
    @staticmethod
    async def get_files_uploaded_by_users(user):
        try:
            # FIND IN DB

            # GET USER ID FIRST

            user_id = user["user_id"] if user else None

            if user_id is None:
                raise HTTPException(status_code=404, detail="USER ID NOT FOUND")

            # EXTRACT USER ID AND FIND FILES UPLOADED BY THIS USER IN DB

            if user:
                from core.database import get_db

                db = get_db()

                cursor = db.files.find(
                    {"sender_ID": user_id, "is_deleted": False},
                    {
                        "_id": 0,
                        "file_id": 1,
                        "filename": 1,
                        "size": 1,
                        "created_at": 1,
                        "storage_key": 1,
                    },
                )

                files = await cursor.to_list(length=None)
                if not files or files is None:
                    raise HTTPException(status_code=404, detail="FILE NOT FOUND")

                return files

            return {"success": True, "message": "API BYPASSED"}

        except HTTPException:
            raise

        except Exception as e:
            print(e)
            raise HTTPException(status_code=500, detail="INTERNAL SERVER ERROR")

    @staticmethod
    async def delete_all_files_hard(user):
        try:
            # 🔐 USER VALIDATION
            user_id = user["user_id"] if user else None

            if not user_id:
                raise HTTPException(status_code=401, detail="Unauthorized")

            db = get_db()

            # 🔍 GET ALL FILES FIRST (for storage delete)
            files_cursor = db.files.find(
                {"sender_ID": user_id}, {"_id": 0, "storage_key": 1}
            )

            files = await files_cursor.to_list(length=None)

            if not files:
                return {"success": True, "message": "No files to delete"}

            storage_keys = [f["storage_key"] for f in files if f.get("storage_key")]
            if storage_keys:
                try:
                    from core.s3_config import delete_many_from_storage
                    await asyncio.to_thread(delete_many_from_storage, storage_keys)
                except Exception as e:
                    print("Bulk storage delete failed:", e)

            result = await db.files.delete_many({"sender_ID": user_id})

            return {"success": True, "deleted_count": result.deleted_count}

        except HTTPException:
            raise

        except Exception as e:
            print(e)
            raise HTTPException(status_code=500, detail="INTERNAL SERVER ERROR")


class sharing_files:
    @staticmethod
    async def share_files_between_client(qr_token, selected_file_ids, sender):
        try:
            db = get_db()

            # 🔐 Validate sender
            sender_id = sender.get("user_id")
            if not sender_id:
                raise HTTPException(status_code=401, detail="Unauthorized")

            def serialize_mongo(doc):
                if not doc:
                    return doc
                doc["_id"] = str(doc["_id"])
                return doc

            session = await db.sharing_session.find_one({"qr_token": qr_token})

            if not session:
                raise HTTPException(status_code=404, detail="Invalid QR")

            # ✅ FIX
            session = serialize_mongo(session)

            receiver_id = session.get("receiver_ID")

            if not receiver_id:
                raise HTTPException(status_code=400, detail="Receiver not found")

            # 🔍 2. Fetch selected files of sender
            files = await db.files.find(
                {
                    "file_id": {"$in": selected_file_ids},
                    "sender_ID": sender_id,
                    "is_deleted": False,
                }
            ).to_list(length=None)

            if not files:
                raise HTTPException(status_code=404, detail="Files not found")

            # ⚡ 3. Create shared copies (NO STORAGE COPY)
            new_docs = []

            for f in files:
                new_docs.append(
                    {
                        "file_id": str(uuid4()),
                        "filename": f["filename"],
                        "size": f["size"],
                        "mime_type": f.get("mime_type"),
                        "storage_key": f["storage_key"],  # 🔥 SAME KEY
                        "sender_ID": receiver_id,  # new owner
                        "original_owner": sender_id,
                        "is_shared": True,
                        "shared_from": sender_id,
                        "sharing_session_id": session["sharing_session_ID"],
                        "is_deleted": False,
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow(),
                    }
                )

            # 💾 4. Bulk insert
            if new_docs:
                await db.files.insert_many(new_docs)

                def mongo_response(data):
                    if isinstance(data, ObjectId):
                        return str(data)

                    elif isinstance(data, datetime):
                        return data.isoformat()

                    elif isinstance(data, list):
                        return [mongo_response(item) for item in data]

                    elif isinstance(data, dict):
                        clean = {}
                        for key, value in data.items():
                            if key == "_id":
                                continue
                            clean[key] = mongo_response(value)
                        return clean

                    return data

            return mongo_response(
                {
                    "success": True,
                    "shared_count": len(new_docs),
                    "receiver_id": receiver_id,
                    "session": session,
                    "files": new_docs,
                }
            )

        except HTTPException:
            raise
        except Exception as e:
            print(e)
            raise HTTPException(status_code=500, detail="INTERNAL SERVER ERROR")
