import io
import boto3
from botocore.client import Config
from fastapi import HTTPException
from docx import Document
from docx.shared import Pt

from core.config import (
    MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY,
    MINIO_REGION,
    MINIO_BUCKET,
    MINIO_ENDPOINT_INTERNAL,
    MINIO_ENDPOINT_PUBLIC,
)

s3_internal = boto3.client(
    "s3",
    endpoint_url=MINIO_ENDPOINT_INTERNAL,
    aws_access_key_id=MINIO_ACCESS_KEY,
    aws_secret_access_key=MINIO_SECRET_KEY,
    region_name=MINIO_REGION,
    config=Config(
        signature_version="s3v4",
        s3={"addressing_style": "path"},
        connect_timeout=5,
        read_timeout=15,
        retries={"max_attempts": 2},
    ),
)

s3_public = boto3.client(
    "s3",
    endpoint_url=MINIO_ENDPOINT_PUBLIC,
    aws_access_key_id=MINIO_ACCESS_KEY,
    aws_secret_access_key=MINIO_SECRET_KEY,
    region_name=MINIO_REGION,
    config=Config(
        signature_version="s3v4",
        s3={"addressing_style": "path"},
    ),
)

SUPPORTED_TYPES = {"pdf", "docx", "doc"}


async def _get_file(file_id: str, user: dict):
    """Shared helper — fetch file doc from DB with auth check."""
    from core.database import get_db

    db = get_db()
    file_doc = await db.files.find_one(
        {
            "file_id": file_id,
            "sender_ID": user["user_id"],
            "is_deleted": False,
        }
    )
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    return file_doc


import asyncio

class EditorController:
    @staticmethod
    async def load_file(file_id: str, user: dict):
        """Return metadata + presigned URL. Frontend fetches PDF/DOCX as blob."""
        file_doc = await _get_file(file_id, user)
        storage_key = file_doc["storage_key"]
        filename = file_doc["filename"]
        ext = filename.rsplit(".", 1)[-1].lower()

        if ext not in SUPPORTED_TYPES:
            raise HTTPException(
                status_code=400, detail=f"Unsupported file type: .{ext}"
            )

        url = await asyncio.to_thread(
            s3_public.generate_presigned_url,
            "get_object",
            Params={
                "Bucket": MINIO_BUCKET,
                "Key": storage_key,
                # No ResponseContentDisposition — let browser decide
            },
            ExpiresIn=3600,
        )

        return {
            "file_id": file_id,
            "filename": filename,
            "ext": ext,
            "url": url,
            "storage_key": storage_key,
        }

    @staticmethod
    async def get_docx_content(file_id: str, user: dict):
        """Fetch DOCX from MinIO → parse → return paragraphs as JSON."""
        file_doc = await _get_file(file_id, user)  # auth check
        storage_key = file_doc["storage_key"]

        try:
            obj = await asyncio.to_thread(
                s3_internal.get_object, Bucket=MINIO_BUCKET, Key=storage_key
            )
            data = await asyncio.to_thread(obj["Body"].read)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Storage fetch failed: {e}")

        try:
            doc = Document(io.BytesIO(data))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse DOCX: {e}")

        paragraphs = []
        for para in doc.paragraphs:
            bold, italic, font_size = False, False, 12
            if para.runs:
                r = para.runs[0]
                bold = bool(r.bold)
                italic = bool(r.italic)
                try:
                    font_size = int(r.font.size.pt) if r.font.size else 12
                except Exception:
                    font_size = 12
            paragraphs.append(
                {
                    "text": para.text,
                    "bold": bold,
                    "italic": italic,
                    "font_size": font_size,
                }
            )

        return {"file_id": file_id, "paragraphs": paragraphs}

    @staticmethod
    async def save_docx(file_id: str, content: list, user: dict):
        """Rebuild DOCX from edited paragraphs → overwrite in MinIO."""
        file_doc = await _get_file(file_id, user)  # auth check
        storage_key = file_doc["storage_key"]

        if not content:
            raise HTTPException(status_code=400, detail="No content provided")

        try:
            doc = Document()
            for para in content:
                p = doc.add_paragraph()
                run = p.add_run(para.get("text", ""))
                run.bold = para.get("bold", False)
                run.italic = para.get("italic", False)
                size = para.get("font_size", 12)
                try:
                    run.font.size = Pt(int(size))
                except Exception:
                    run.font.size = Pt(12)

            buf = io.BytesIO()
            doc.save(buf)
            buf.seek(0)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to build DOCX: {e}")

        try:
            await asyncio.to_thread(
                s3_internal.put_object,
                Bucket=MINIO_BUCKET,
                Key=storage_key,
                Body=buf.getvalue(),
                ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Storage save failed: {e}")

        return {"success": True, "file_id": file_id}

