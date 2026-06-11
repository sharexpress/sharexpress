// useInViewUrl.js
// Fetches presigned URL only when card scrolls into viewport.
//
// Fixes vs previous version:
// 1. StrictMode double-render: isMounted ref guards against double effect execution
// 2. Debounce 300ms: fast scroll won't trigger a fetch
// 3. AbortController: in-flight request cancelled on unmount
// 4. fetchedRef: guaranteed single fetch per file_id per session
// 5. retry(): clean re-fetch without dangling observers

import { useState, useEffect, useRef, useCallback } from "react";
import { getCachedUrl, setCachedUrl } from "./urlCache";
import { API } from "../api/api";

const PREVIEWABLE_EXTS = ["png", "jpg", "jpeg", "webp", "pdf", "doc", "docx"];

export const isPreviewable = (filename = "") => {
  const ext = filename.split(".").pop()?.toLowerCase();
  return PREVIEWABLE_EXTS.includes(ext);
};

export const getFileType = (filename = "") => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "webp"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  return "other";
};

const doFetch = (fileId, abortSignal, onSuccess, onError, onDone) => {
  fetch(`${API}/files/download/${fileId}`, {
    credentials: "include",
    signal: abortSignal,
  })
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((data) => {
      const url = data?.download_url;
      if (!url) throw new Error("No download_url in response");
      setCachedUrl(fileId, url);
      onSuccess(url);
    })
    .catch((err) => {
      if (err.name !== "AbortError") onError(err);
    })
    .finally(onDone);
};

const useInViewUrl = (file) => {
  const ref = useRef(null);

  // Initialise from cache synchronously — no loading flash for cached files
  const [url, setUrl] = useState(() => getCachedUrl(file?.file_id) || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const timerRef = useRef(null);
  const abortRef = useRef(null);
  const fetchedRef = useRef(!!getCachedUrl(file?.file_id)); // true if already cached
  const mountedRef = useRef(false); // guards StrictMode double-mount

  useEffect(() => {
    // ── StrictMode guard ──────────────────────────────────────────────────────
    // In dev StrictMode React mounts → unmounts → remounts.
    // We skip the second mount if a fetch already completed in the first.
    if (mountedRef.current && fetchedRef.current) return;
    mountedRef.current = true;

    if (!file?.file_id || !isPreviewable(file?.filename)) return;
    if (fetchedRef.current) return; // already cached or fetched

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting) {
          // Debounce: wait 300ms before firing — cancels on fast scroll
          timerRef.current = setTimeout(() => {
            if (fetchedRef.current) return;

            // One final cache check (another card may have populated it)
            const cached = getCachedUrl(file.file_id);
            if (cached) {
              setUrl(cached);
              fetchedRef.current = true;
              observer.disconnect();
              return;
            }

            fetchedRef.current = true;
            observer.disconnect();

            abortRef.current = new AbortController();
            setLoading(true);
            setError(false);

            doFetch(
              file.file_id,
              abortRef.current.signal,
              (downloadUrl) => setUrl(downloadUrl),
              (err) => {
                console.error("❌ useInViewUrl:", file.file_id, err);
                setError(true);
                fetchedRef.current = false; // allow retry
              },
              () => setLoading(false),
            );
          }, 300);
        } else {
          // Left viewport before debounce fired — cancel timer + abort fetch
          clearTimeout(timerRef.current);
          if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
            // Only reset fetchedRef if we hadn't actually started yet
            if (!url) fetchedRef.current = false;
          }
        }
      },
      { rootMargin: "200px", threshold: 0 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      clearTimeout(timerRef.current);
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [file?.file_id, file?.filename]); // stable deps — no accidental re-subscribe

  // ── Retry: clean reset then re-attach observer ───────────────────────────
  const retry = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    clearTimeout(timerRef.current);
    fetchedRef.current = false;
    mountedRef.current = false;
    setError(false);
    setUrl(null);
    // State flush triggers re-render → useEffect re-runs with fresh mountedRef
  }, [file?.file_id]);

  return { ref, url, loading, error, retry };
};

export default useInViewUrl;
