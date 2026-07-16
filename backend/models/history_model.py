# Copyright 2026 Sharexpress Contributors
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

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import uuid4, UUID


class FileMeta(BaseModel):
    file_id: str
    filename: str
    size: int
    mime_type: Optional[str] = None


class UserMeta(BaseModel):
    user_id: str
    name: Optional[str] = None
    user_type: Optional[str] = None


class TransferHistory(BaseModel):
    transfer_id: UUID = Field(default_factory=uuid4)

    sender: UserMeta
    receiver: UserMeta

    direction: str = Field(..., description="Direction of transfer: sender_to_receiver")

    files: List[FileMeta]

    total_files: int
    total_size: int

    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

    sharing_session_id: Optional[str] = None


    status: str = Field(default="completed", description="pending / completed / failed")

    metadata: Optional[dict] = None