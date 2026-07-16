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

// urlCache.js
// Persists presigned download URLs in sessionStorage.
// TTL is 9 min — presigned URLs expire at 10min, 1min safety buffer.
// Clears automatically when the tab/browser is closed.

const CACHE_KEY = "sharexpress_download_urls";
const TTL_MS = 9 * 60 * 1000;

const readCache = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeCache = (cache) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // sessionStorage quota — fail silently
  }
};

export const getCachedUrl = (fileId) => {
  const cache = readCache();
  const entry = cache[fileId];
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    delete cache[fileId];
    writeCache(cache);
    return null;
  }
  return entry.url;
};

export const setCachedUrl = (fileId, url) => {
  const cache = readCache();
  cache[fileId] = { url, expiresAt: Date.now() + TTL_MS };
  writeCache(cache);
};

export const removeCachedUrl = (fileId) => {
  const cache = readCache();
  delete cache[fileId];
  writeCache(cache);
};

export const clearUrlCache = () => {
  sessionStorage.removeItem(CACHE_KEY);
};
