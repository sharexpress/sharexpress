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

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/api";

export const SessionCreate = createAsyncThunk(
  "share/create",
  async (qr_token, { rejectWithValue }) => {
    try {
      const res = await api.post("/share/create", { qr_token });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Session Creation failed",
      );
    }
  },
);

export const revokeSession = createAsyncThunk(
  "share/revoke",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.delete("/share/revoke");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "SESSION REVOKE FAILED",
      );
    }
  },
);

export const check_session = createAsyncThunk(
  "share/check",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/share/check");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "SESSION CHECK FAILED",
      );
    }
  },
);

export const SessionSlice = createSlice({
  name: "session",

  initialState: {
    loading: false,
    error: null,

    check_loading: false,
    check_success: false,
    check_error: null,
    check_sender_name: null,
    check_receiver_name: null,
    check_mode: null,

    success: null,
    mode: null,
    sharing_token: null,
    session_id: null,

    sender_name: null,
    sender_type: null,
    sender_ID: null,

    receiver_ID: null,
    receiver_type: null,
    reciever_name: null,

    receiver_QR: null, // existing (unchanged)
    receiver_qr_token: null, // ✅ NEW
  },

  reducers: {
    clearSessionState: (state) => {
      state.success = false;
      state.sender_name = null;
      state.reciever_name = null;
      state.error = null;
      state.sharing_token = null;
      state.mode = null;
      state.sender_ID = null;
      state.receiver_ID = null;

      state.receiver_QR = null;
      state.receiver_qr_token = null; // ✅ reset added
    },

    socketEvent: (state, action) => {
      const data = action.payload;

      if (data.type === "CONNECTED") {
        state.check_success = true;
        state.check_sender_name = data.sender_name || null;
        state.check_receiver_name = data.receiver_name || null;
        state.check_mode = "ACTIVE";
      }

      if (data.type === "FILE_UPLOAD_START") {
        console.log("📁 File incoming:", data.file_name);
      }

      if (data.type === "RESTORE") {
        state.check_sender_name = data.sender_name || null;
        state.check_receiver_name = data.receiver_name || null;
        state.check_mode = data.status || null;
      }
    },
  },

  extraReducers: (builder) => {
    // CREATE SESSION
    builder.addCase(SessionCreate.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(SessionCreate.fulfilled, (state, action) => {
      const payload = action.payload;

      state.loading = false;
      state.success = true;
      state.error = null;

      state.mode = payload.mode;
      state.sharing_token = payload.sharing_token;
      state.session_id = payload.session_id;

      state.sender_name = payload.sender_name;
      state.sender_type = payload.sender_type;
      state.sender_ID = payload.sender_ID;

      state.receiver_ID = payload.receiver_ID;
      state.receiver_type = payload.receiver_type;

      state.reciever_name =
        payload.reciever_name || payload.receiver_name || null;

      // ✅ NEW FIELD
      state.receiver_qr_token = payload.receiver_qr_token || null;
    });

    builder.addCase(SessionCreate.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "SESSION CREATION FAILED";

      state.sender_name = null;
      state.sender_type = null;
      state.sender_ID = null;

      state.receiver_ID = null;
      state.receiver_type = null;
      state.reciever_name = null;
      state.receiver_qr_token = null;
    });

    // REVOKE SESSION
    builder.addCase(revokeSession.pending, (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    });

    builder.addCase(revokeSession.fulfilled, (state) => {
      state.loading = false;
      state.success = false;

      state.sender_name = null;
      state.reciever_name = null;
      state.sharing_token = null;

      state.check_success = false;
      state.receiver_qr_token = null;
    });

    builder.addCase(revokeSession.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload || "REVOKE SESSION FAILED";
    });

    // CHECK SESSION
    builder.addCase(check_session.pending, (state) => {
      state.check_error = null;
      state.check_loading = true;
      state.check_success = false;

      state.check_sender_name = null;
      state.check_receiver_name = null;
      state.check_mode = null;
    });

    builder.addCase(check_session.fulfilled, (state, action) => {
      const payload = action.payload;

      state.check_error = null;
      state.check_loading = false;
      state.check_success = true;

      state.check_sender_name = payload?.sender_name || null;

      state.check_receiver_name =
        payload?.receiver_name || payload?.reciever_name || null;

      state.check_mode = payload?.mode || null;
      state.session_id = payload?.session_id || null;
    });

    builder.addCase(check_session.rejected, (state, action) => {
      state.check_error = action.payload || "ERROR OCCURRED";
      state.check_loading = false;
      state.check_success = false;
    });
  },
});

export const { clearSessionState, socketEvent } = SessionSlice.actions;
export const SessionReducer = SessionSlice.reducer;
