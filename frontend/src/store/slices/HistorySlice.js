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

export const fetchHistory = createAsyncThunk(
  "history/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/history"); // 🔥 your route
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch history");
    }
  },
);

export const fetchSessionHistory = createAsyncThunk(
  "history/session",
  async (session_id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/history/${session_id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to fetch session history",
      );
    }
  },
);

export const fetchHistoryByTransferID = createAsyncThunk(
  "history/{ID}",
  async (transfer_ID, { rejectWithValue }) => {
    try {
      const res = await api.get(`/history/${transfer_ID}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  },
);

const historySlice = createSlice({
  name: "history",

  initialState: {
    loading: false,
    error: null,

    histories: [],

    session_loading: false,
    session_error: null,
    session_history: null,

    transfer_loading: false,
    transfer_error: null,
    transfer_history: null,
  },

  reducers: {
    clearHistory: (state) => {
      state.histories = [];
      state.error = null;
    },

    clearSessionHistory: (state) => {
      state.session_history = null;
      state.session_error = null;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchHistory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchHistory.fulfilled, (state, action) => {
      state.loading = false;
      state.histories = action.payload?.history || [];
    });

    builder.addCase(fetchHistory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    builder.addCase(fetchSessionHistory.pending, (state) => {
      state.session_loading = true;
      state.session_error = null;
    });

    builder.addCase(fetchSessionHistory.fulfilled, (state, action) => {
      state.session_loading = false;
      state.session_history = action.payload?.history || null;
    });
    builder.addCase(fetchSessionHistory.rejected, (state, action) => {
      state.session_loading = false;
      state.session_error = action.payload;
    });

    builder.addCase(fetchHistoryByTransferID.pending, (state) => {
      state.transfer_loading = true;
      state.transfer_error = null;
      state.transfer_history = null;
    });

    builder.addCase(fetchHistoryByTransferID.fulfilled, (state, action) => {
      state.transfer_loading = false;

      console.log("FULL RESPONSE:", action.payload);

      state.transfer_history = action.payload?.data || null; // ✅ FIX
    });

    builder.addCase(fetchHistoryByTransferID.rejected, (state, action) => {
      state.transfer_loading = false;
      state.transfer_error = action.payload;
    });
  },
});

export const { clearHistory, clearSessionHistory } = historySlice.actions;

export const historyReducer = historySlice.reducer;
