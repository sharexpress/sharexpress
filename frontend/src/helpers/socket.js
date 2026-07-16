/*
 * Copyright 2026 Sharexpress Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { socketEvent } from "../store/slices/ShareSessionSlice";
import { fetchUserFiles, fetchSessionFiles } from "../store/slices/FileSlices";
import { fetchHistory } from "../store/slices/HistorySlice";
import { API } from "../api/api";
import { toast } from "react-toastify";

let socket = null;
let reconnectTimeout = null;
let reconnectAttempts = 0;
const MAX_ATTEMPTS = 5;

export const connectSocket = (qr_id, dispatch) => {
  if (!qr_id) return;

  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  const wsBase = API.replace(/^http/, "ws");
  socket = new WebSocket(`${wsBase}/share/ws/${qr_id}`);

  socket.onopen = () => {
    console.log("✅ WS CONNECTED");
    reconnectAttempts = 0;

    socket.send(
      JSON.stringify({
        type: "INIT",
        qr_id,
      }),
    );
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("📩 WS DATA:", data);
    dispatch(socketEvent(data));

    if (data.type === "FILES_SHARED") {
      toast.success("New files shared with you!");
      dispatch(fetchUserFiles());
      dispatch(fetchHistory());
      if (data.session_id) {
        dispatch(fetchSessionFiles(data.session_id));
      }
    }
  };

  socket.onclose = () => {
    console.log("❌ WS CLOSED");
    socket = null;

    if (reconnectAttempts < MAX_ATTEMPTS) {
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
      console.log(`🔄 Retrying WS connection in ${delay}ms (Attempt ${reconnectAttempts + 1}/${MAX_ATTEMPTS})`);
      reconnectTimeout = setTimeout(() => {
        reconnectAttempts++;
        connectSocket(qr_id, dispatch);
      }, delay);
    }
  };
};

export const disconnectSocket = () => {
  reconnectAttempts = MAX_ATTEMPTS;
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  if (socket) {
    socket.close();
    socket = null;
  }
};
