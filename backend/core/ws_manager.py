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

import json
import asyncio
from fastapi import WebSocket
from typing import Dict, List
from lib.redis import async_redis_client


class WSManager:
    def __init__(self):
        self.rooms: Dict[str, List[WebSocket]] = {}
        self.pubsub_tasks: Dict[str, asyncio.Task] = {}
        self.redis_active = True

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()

        is_new_room = room_id not in self.rooms
        if is_new_room:
            self.rooms[room_id] = []

        self.rooms[room_id].append(websocket)
        print(f"🔌 WS client connected to room: {room_id}. Total local clients: {len(self.rooms[room_id])}")

        if is_new_room:
            self.pubsub_tasks[room_id] = asyncio.create_task(
                self._subscribe_to_redis_room(room_id)
            )

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.rooms:
            try:
                self.rooms[room_id].remove(websocket)
            except ValueError:
                pass

            if not self.rooms[room_id]:
                del self.rooms[room_id]
                task = self.pubsub_tasks.pop(room_id, None)
                if task:
                    task.cancel()
                    print(f"🧹 Unsubscribed from Redis channel for room: {room_id}")

    async def _subscribe_to_redis_room(self, room_id: str):
        pubsub = None
        try:
            pubsub = async_redis_client.pubsub()
            await pubsub.subscribe(f"room:{room_id}")
            print(f"📡 Subscribed to Redis channel: room:{room_id}")

            async for message in pubsub.listen():
                if message["type"] == "message":
                    try:
                        data = json.loads(message["data"])
                        for ws in list(self.rooms.get(room_id, [])):
                            try:
                                await ws.send_json(data)
                            except Exception:
                                pass
                    except Exception as e:
                        print("Error parsing / broadcasting Redis pubsub message:", e)
        except asyncio.CancelledError:
            if pubsub:
                try:
                    await pubsub.unsubscribe(f"room:{room_id}")
                    await pubsub.close()
                except Exception:
                    pass
        except Exception as e:
            print(f"Redis Pub/Sub subscription failed for room {room_id}: {e}")
            self.redis_active = False

    async def send_to_room(self, room_id: str, data: dict):
        if self.redis_active:
            try:
                await async_redis_client.publish(f"room:{room_id}", json.dumps(data))
                return
            except Exception as e:
                print(f"Failed to publish to Redis room {room_id} ({e}). Falling back to local broadcast.")
                self.redis_active = False

        for ws in list(self.rooms.get(room_id, [])):
            try:
                await ws.send_json(data)
            except Exception:
                pass


ws_manager = WSManager()
