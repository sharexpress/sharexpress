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
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime, timedelta
from typing import Optional
from uuid import uuid4
from models.File_setup import Role


class ParticipantsType(str, Enum):
    USER = "user"
    SESSION = "session"


class Status(str, Enum):
    ACTIVE = "ACTIVE"
    PENDING = "PENDING"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"
    COMPLETED = "COMPLETED"


class SharingSession(BaseModel):
    # Primary identifiers
    sharing_session_ID: str = Field(default_factory=lambda: str(uuid4()))
    qr_token: str
    sharing_token: str

    # Participants
    sender_name: str
    sender_ID: str
    sender_type: ParticipantsType

    # ROLE

    receiver_ID: Optional[str] = None
    receiver_type: ParticipantsType
    reciever_name: str

    # State
    status: Status = Status.PENDING
    is_active: bool = False

    # Expiration & Audit
    expires_at: datetime = Field(default_factory=lambda: datetime.utcnow() + timedelta(minutes=15))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    claimed_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None
