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

import logging
from core.database import get_db

db = get_db()
logger = logging.getLogger(__name__)


async def cleanup_duplicate_sessions():
    """Finds and deletes duplicate sharing_session documents keeping only the latest one."""
    try:
        pipeline = [
            {
                "$group": {
                    "_id": {
                        "qr_token": "$qr_token",
                        "sender_ID": "$sender_ID",
                        "receiver_ID": "$receiver_ID"
                    },
                    "count": {"$sum": 1},
                    "docs": {"$push": {"_id": "$_id", "created_at": "$created_at"}}
                }
            },
            {"$match": {"count": {"$gt": 1}}}
        ]
        
        cursor = db.sharing_session.aggregate(pipeline)
        async for group in cursor:
            docs = group["docs"]
            docs.sort(key=lambda d: d.get("created_at") or d["_id"])
            ids_to_delete = [d["_id"] for d in docs[:-1]]
            await db.sharing_session.delete_many({"_id": {"$in": ids_to_delete}})
            logger.info(f"Deleted {len(ids_to_delete)} duplicate sharing_session documents for group {group['_id']}")
    except Exception as e:
        logger.error(f"Failed to cleanup duplicate sharing_sessions: {e}")


async def cleanup_duplicate_qr_codes():
    """Finds and deletes duplicate qr_codes documents keeping only the latest one."""
    try:
        pipeline = [
            {
                "$group": {
                    "_id": "$qr_token",
                    "count": {"$sum": 1},
                    "docs": {"$push": {"_id": "$_id", "created_at": "$created_at"}}
                }
            },
            {"$match": {"count": {"$gt": 1}}}
        ]
        
        cursor = db.qr_codes.aggregate(pipeline)
        async for group in cursor:
            docs = group["docs"]
            docs.sort(key=lambda d: d.get("created_at") or d["_id"])
            ids_to_delete = [d["_id"] for d in docs[:-1]]
            await db.qr_codes.delete_many({"_id": {"$in": ids_to_delete}})
            logger.info(f"Deleted {len(ids_to_delete)} duplicate qr_codes documents for qr_token {group['_id']}")
    except Exception as e:
        logger.error(f"Failed to cleanup duplicate qr_codes: {e}")


async def cleanup_duplicate_files():
    """Finds and deletes duplicate files documents keeping only the latest one."""
    try:
        pipeline = [
            {
                "$group": {
                    "_id": "$file_id",
                    "count": {"$sum": 1},
                    "docs": {"$push": {"_id": "$_id", "created_at": "$created_at"}}
                }
            },
            {"$match": {"count": {"$gt": 1}}}
        ]
        
        cursor = db.files.aggregate(pipeline)
        async for group in cursor:
            docs = group["docs"]
            docs.sort(key=lambda d: d.get("created_at") or d["_id"])
            ids_to_delete = [d["_id"] for d in docs[:-1]]
            await db.files.delete_many({"_id": {"$in": ids_to_delete}})
            logger.info(f"Deleted {len(ids_to_delete)} duplicate files documents for file_id {group['_id']}")
    except Exception as e:
        logger.error(f"Failed to cleanup duplicate files: {e}")


async def create_indexes():
    # 1. Cleanup any historical duplicate documents before building unique indexes
    await cleanup_duplicate_sessions()
    await cleanup_duplicate_qr_codes()
    await cleanup_duplicate_files()

    # 2. List of indexes to create: (collection, keys, options)
    indexes = [
        # sharing_session
        (
            db.sharing_session,
            [("qr_token", 1), ("sender_ID", 1), ("receiver_ID", 1)],
            {"unique": True, "name": "unique_share_relationship"},
        ),
        (db.sharing_session, "sharing_session_ID", {"unique": True}),
        (db.sharing_session, "sharing_token", {"unique": True}),
        (db.sharing_session, "sender_ID", {}),
        (db.sharing_session, "receiver_ID", {}),
        (db.sharing_session, "status", {}),
        # qr_codes
        (db.qr_codes, "qr_token", {"unique": True}),
        (db.qr_codes, "owner_id", {}),
        # files
        (db.files, "file_id", {"unique": True}),
        (db.files, "sharing_session_id", {}),
        (db.files, "sender_ID", {}),
        (db.files, "is_deleted", {}),
        # TTL Indexes
        (db.guest_sessions, "expires_at", {"expireAfterSeconds": 0}),
        (db.qr_access_log, "timestamp", {"expireAfterSeconds": 90 * 24 * 60 * 60}),
        (db.activity_log, "timestamp", {"expireAfterSeconds": 90 * 24 * 60 * 60}),
        (db.files, "expires_at", {"expireAfterSeconds": 0}),
        (db.sharing_session, "expires_at", {"expireAfterSeconds": 0}),
    ]

    for collection, keys, options in indexes:
        try:
            await collection.create_index(keys, **options)
        except Exception as e:
            logger.warning(
                f"Failed to create index on '{collection.name}' for keys {keys} with options {options}: {e}"
            )

