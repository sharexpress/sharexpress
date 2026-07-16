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

import { api } from "../../api/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const shareFiles = createAsyncThunk(
  "files/shareFiles",
  async ({ qr_token, file_ids }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/files/share`, { qr_token, file_ids });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Share failed");
    }
  },
);

const initialState = {
  loading: false,
  success: false,
  error: null,
};

const shareFilesSlice = createSlice({
  name: "shareFiles",
  initialState,

  reducers: {
    resetShareState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(shareFiles.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(shareFiles.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })

      .addCase(shareFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "something went wrong";
      });
  },
});

export const { resetShareState } = shareFilesSlice.actions;
export const share_FilesSlice = shareFilesSlice.reducer;
