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

export const initUpload = createAsyncThunk(
  "files/initUpload",
  async (files, { rejectWithValue }) => {
    try {
      const payload = {
        files: files.map((f) => ({
          filename: f.name,
          size: f.size,
          content_type: f.type,
        })),
      };

      const res = await api.post("/files/init-upload", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Upload init failed");
    }
  },
);

export const completeUpload = createAsyncThunk(
  "files/completeUpload",
  async (files, { rejectWithValue }) => {
    try {
      const res = await api.post("/files/complete-upload", {
        files,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Upload complete failed");
    }
  },
);

export const fetchUserFiles = createAsyncThunk(
  "files/fetchUserFiles",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/files/user/files");

      console.log("API RESPONSE:", res.data);

      return res.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || "Fetch failed");
    }
  },
);

export const deleteAllFiles = createAsyncThunk(
  "files/deleteAllFiles",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.delete("/files/user/files");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Delete all failed");
    }
  },
);

export const fetchSessionFiles = createAsyncThunk(
  "files/fetchSessionFiles",
  async (session_id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/files/session/${session_id}/list`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Session files fetch failed");
    }
  },
);

const FileSlice = createSlice({
  name: "files",

  initialState: {
    uploading: false,
    error: null,
    files: [],
    userFiles: [],
    loadingFiles: false,
    sessionFiles: [],
    loadingSessionFiles: false,
    progressMap: {},
    statusMap: {},
  },
  reducers: {
    setFiles: (state, action) => {
      state.files = action.payload;
      state.progressMap = {};
      state.statusMap = {};
    },

    setFileProgress: (state, action) => {
      const { index, progress } = action.payload;
      state.progressMap[index] = progress;
    },

    setFileStatus: (state, action) => {
      const { index, status } = action.payload;
      state.statusMap[index] = status;
    },
    removeFile: (state, action) => {
      const index = action.payload;

      state.files.splice(index, 1);

      delete state.progressMap[index];
      delete state.statusMap[index];

      // 🔥 reindex maps (important)
      const newProgress = {};
      const newStatus = {};

      state.files.forEach((_, i) => {
        newProgress[i] = state.progressMap[i] || 0;
        newStatus[i] = state.statusMap[i] || null;
      });

      state.progressMap = newProgress;
      state.statusMap = newStatus;
    },

    removeAllFiles: (state) => {
      state.files = [];
      state.progressMap = {};
      state.statusMap = {};
    },

    resetUpload: (state) => {
      state.uploading = false;
      state.error = null;
      state.files = [];
      state.progressMap = {};
      state.statusMap = {};
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(initUpload.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(initUpload.fulfilled, (state) => {
        state.uploading = false;
      })
      .addCase(initUpload.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })
      .addCase(completeUpload.fulfilled, (state) => {
        state.uploading = false;
      })
      .addCase(completeUpload.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })

      .addCase(fetchUserFiles.pending, (state) => {
        state.loadingFiles = true;
      })

      .addCase(fetchUserFiles.fulfilled, (state, action) => {
        console.log("REDUX PAYLOAD:", action.payload);

        state.loadingFiles = false;
        state.userFiles = action.payload || [];
      })

      .addCase(fetchUserFiles.rejected, (state, action) => {
        state.loadingFiles = false;
        state.error = action.payload;
      })

      .addCase(deleteAllFiles.fulfilled, (state) => {
        state.userFiles = [];
      });

    builder
      .addCase(fetchSessionFiles.pending, (state) => {
        state.loadingSessionFiles = true;
      })
      .addCase(fetchSessionFiles.fulfilled, (state, action) => {
        state.loadingSessionFiles = false;
        state.sessionFiles = action.payload?.files || [];
      })
      .addCase(fetchSessionFiles.rejected, (state, action) => {
        state.loadingSessionFiles = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFiles,
  setFileProgress,
  setFileStatus,
  removeFile,
  removeAllFiles,
  resetUpload,
} = FileSlice.actions;
export const FileReducer = FileSlice.reducer;
