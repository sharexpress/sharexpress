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

from core.database import get_db

db = get_db()


async def create_indexes():
    # sharing_session indexes
    await db.sharing_session.create_index(
        [
            ("qr_token", 1),
            ("sender_ID", 1),
            ("receiver_ID", 1),
        ],
        unique=True,
        name="unique_share_relationship",
    )

    await db.sharing_session.create_index("sharing_session_ID", unique=True)
    await db.sharing_session.create_index("sharing_token", unique=True)
    await db.sharing_session.create_index("sender_ID")
    await db.sharing_session.create_index("receiver_ID")
    await db.sharing_session.create_index("status")

    # qr_codes indexes
    await db.qr_codes.create_index("qr_token", unique=True)
    await db.qr_codes.create_index("owner_id")

    # files indexes
    await db.files.create_index("file_id", unique=True)
    await db.files.create_index("sharing_session_id")
    await db.files.create_index("sender_ID")
    await db.files.create_index("is_deleted")
