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

import React, { useEffect, useState, useRef, useCallback } from "react";
import { shareFiles, resetShareState } from "../../store/slices/shareFiles";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserFiles,
  initUpload,
  completeUpload,
  setFiles,
  setFileProgress,
  setFileStatus,
} from "../../store/slices/FileSlices";
import { toast } from "react-toastify";
import WButton from "../WButton";
import { getCachedUrl, setCachedUrl } from "../../helpers/urlCache";
import {
  CloudUpload,
  FileText,
  Image,
  File,
  Loader2,
  Share2,
  Check,
  X,
  Upload,
  CheckSquare,
  Square,
} from "lucide-react";
import { BsSend } from "react-icons/bs";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatSize = (size) => {
  if (!size) return "0 B";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileType = (filename = "") => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["mp4", "webm", "mov"].includes(ext)) return "video";
  return "other";
};

const getExt = (filename = "") =>
  filename.split(".").pop()?.toUpperCase() || "FILE";

let pdfjsPromise = null;
const getPdfJs = () => {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
      return lib;
    });
  }
  return pdfjsPromise;
};

const PdfCanvasThumb = ({ url }) => {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    let pdfDoc = null;
    let renderTask = null;

    (async () => {
      try {
        const lib = await getPdfJs();
        if (cancelled) return;
        pdfDoc = await lib.getDocument({ url, verbosity: 0 }).promise;
        if (cancelled) {
          pdfDoc.destroy();
          return;
        }
        const page = await pdfDoc.getPage(1);
        if (cancelled) {
          page.cleanup();
          pdfDoc.destroy();
          return;
        }
        const canvas = canvasRef.current;
        if (!canvas || cancelled) {
          page.cleanup();
          pdfDoc.destroy();
          return;
        }
        const vp = page.getViewport({ scale: 1 });
        const scale = canvas.parentElement?.offsetWidth / vp.width || 1;
        const scaled = page.getViewport({ scale });
        canvas.width = scaled.width;
        canvas.height = scaled.height;
        renderTask = page.render({
          canvasContext: canvas.getContext("2d"),
          viewport: scaled,
        });
        await renderTask.promise;
        if (!cancelled) setRendered(true);
      } catch (err) {
        if (!cancelled && err?.name !== "RenderingCancelledException")
          setFailed(true);
      } finally {
        try {
          pdfDoc?.destroy();
        } catch (err) {
          err;
        }
        pdfDoc = null;
        renderTask = null;
      }
    })();

    return () => {
      cancelled = true;
      try {
        renderTask?.cancel();
      } catch (_) {}
      const c = canvasRef.current;
      if (c) {
        c.width = 0;
        c.height = 0;
      }
    };
  }, [url]);

  if (failed)
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-[#0f0f0f]">
        <FileText size={18} className="text-red-400/60" />
        <span className="text-[9px] text-[#333] font-mono">PDF</span>
      </div>
    );

  return (
    <div className="w-full h-full relative bg-[#0f0f0f] overflow-hidden">
      {!rendered && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 size={13} className="text-[#333] animate-spin" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`w-full h-full transition-opacity duration-300 ${rendered ? "opacity-100" : "opacity-0"}`}
        style={{ objectFit: "cover", imageRendering: "crisp-edges" }}
      />
    </div>
  );
};

const DocThumb = ({ filename }) => {
  const ext = getExt(filename);
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#0d1520]">
      {/* Document icon with page lines */}
      <div className="relative">
        <div className="w-8 h-10 rounded-sm bg-[#1e3a5f] border border-blue-900/50 flex flex-col justify-end p-1 gap-[3px]">
          <div className="h-[2px] rounded-full bg-blue-400/50 w-full" />
          <div className="h-[2px] rounded-full bg-blue-400/40 w-4/5" />
          <div className="h-[2px] rounded-full bg-blue-400/30 w-3/5" />
          <div className="h-[2px] rounded-full bg-blue-400/20 w-2/5" />
          {/* Folded corner */}
          <div
            className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#0d0d0d] border-l border-b border-blue-900/40"
            style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
          />
        </div>
      </div>
      <span className="text-[9px] text-blue-400/50 font-mono tracking-widest">
        {ext}
      </span>
    </div>
  );
};

// ─── Other file thumbnail ──────────────────────────────────────────────────────
const OtherThumb = ({ filename }) => {
  const ext = getExt(filename);
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-[#0f0f0f]">
      <File size={18} className="text-[#333]" />
      <span className="text-[9px] text-[#333] font-mono tracking-wider">
        {ext}
      </span>
    </div>
  );
};

// ─── FileThumbnail ─────────────────────────────────────────────────────────────
// Lazy-fetch presigned URL via IntersectionObserver + urlCache
// Then route to correct renderer by file type
const FileThumbnail = ({ file }) => {
  const {
    loading: sharingLoading,
    success: shareSuccess,
    error: shareError,
  } = useSelector((state) => state.shareFiles);

  const type = getFileType(file.filename);

  const [url, setUrl] = useState(() => getCachedUrl(file.file_id));
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const elRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // DOC and OTHER don't need a URL — render icon immediately
    if (url || type === "other" || type === "doc") return;

    const el = elRef.current;
    if (!el) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observerRef.current?.disconnect();

        const cached = getCachedUrl(file.file_id);
        if (cached) {
          setUrl(cached);
          return;
        }

        setLoading(true);
        fetch(`http://localhost:8000/files/download/${file.file_id}`, {
          credentials: "include",
        })
          .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          })
          .then((data) => {
            const downloadUrl = data?.download_url;
            if (!downloadUrl) throw new Error("No download_url");
            setCachedUrl(file.file_id, downloadUrl);
            setUrl(downloadUrl);
          })
          .catch(() => setFailed(true))
          .finally(() => setLoading(false));
      },
      { rootMargin: "100px", threshold: 0 },
    );

    observerRef.current.observe(el);
    return () => observerRef.current?.disconnect();
  }, [file.file_id, type, url]);

  return (
    <div ref={elRef} className="w-full h-full">
      {/* DOC — always visible, no URL needed */}
      {type === "doc" && <DocThumb filename={file.filename} />}

      {/* OTHER — always visible */}
      {type === "other" && <OtherThumb filename={file.filename} />}

      {/* URL fetching spinner */}
      {loading && type !== "doc" && type !== "other" && (
        <div className="w-full h-full flex items-center justify-center bg-[#0f0f0f]">
          <Loader2 size={14} className="text-[#333] animate-spin" />
        </div>
      )}

      {/* IMAGE */}
      {!loading && type === "image" && url && !failed && (
        <img
          src={url}
          alt={file.filename}
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
        />
      )}

      {/* VIDEO */}
      {!loading && type === "video" && url && !failed && (
        <video
          src={url}
          muted
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      )}

      {/* PDF — pdfjs canvas */}
      {!loading && type === "pdf" && url && !failed && (
        <PdfCanvasThumb url={url} />
      )}

      {/* Failed fallback */}
      {!loading && failed && <OtherThumb filename={file.filename} />}

      {/* Waiting for observer (not yet in viewport) */}
      {!loading && !url && !failed && type !== "doc" && type !== "other" && (
        <div className="w-full h-full bg-[#0f0f0f]" />
      )}
    </div>
  );
};

// ─── Existing file card ────────────────────────────────────────────────────────
const ExistingFileCard = ({ file, selected, onToggle }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/share/${file.file_id}`,
      );
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div
      onClick={onToggle}
      className={`group relative rounded-xl border cursor-pointer overflow-hidden transition-all duration-200
        ${
          selected
            ? "border-white/40 ring-1 ring-white/10"
            : "border-[#ffffff0a] hover:border-[#ffffff18]"
        }`}
    >
      {/* THUMBNAIL */}
      <div className="h-[86px] overflow-hidden">
        <FileThumbnail file={file} />
      </div>

      {/* SELECTION CIRCLE */}
      <div
        className={`absolute top-1.5 left-1.5 w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-150
        ${
          selected
            ? "bg-white border-white scale-100"
            : "border-white/30 bg-black/50 scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100"
        }`}
      >
        {selected && <Check size={9} strokeWidth={3} className="text-black" />}
      </div>

      {/* SHARE BUTTON */}
      <button
        onClick={handleShare}
        className={`absolute top-1.5 right-1.5 p-1 rounded-md transition-all duration-150 backdrop-blur-sm
          ${
            copied
              ? "bg-green-500/25 text-green-400 opacity-100"
              : "bg-black/50 text-[#777] opacity-0 group-hover:opacity-100 hover:text-white"
          }`}
      >
        {copied ? <Check size={10} /> : <Share2 size={10} />}
      </button>

      {/* FILE INFO */}
      <div className="px-2 py-1.5 bg-[#0a0a0a] border-t border-[#ffffff06]">
        <p className="text-white text-[10px] truncate leading-tight font-medium">
          {file.filename}
        </p>
        <p className="text-[#3a3a3a] text-[9px] mt-0.5">
          {formatSize(file.size)}
        </p>
      </div>
    </div>
  );
};

// ─── MAIN MODAL ───────────────────────────────────────────────────────────────
const UploadModal = ({ onClose }) => {
  const dispatch = useDispatch();

  const {
    userFiles = [],
    files = [],
    progressMap = {},
    statusMap = {},
    loadingFiles,
  } = useSelector((state) => state.files);

  const [activeTab, setActiveTab] = useState("files");
  const [prevTab, setPrevTab] = useState("files");
  const [animating, setAnimating] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [localFiles, setLocalFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const dragCounterRef = useRef(0);

  const { receiver_qr_token } = useSelector((state) => state.session);

  console.log("QR = ", receiver_qr_token);

  useEffect(() => {
    dispatch(fetchUserFiles());
  }, [dispatch]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // ── Tab switch with crossfade ───────────────────────────────────────────
  const switchTab = (tab) => {
    if (tab === activeTab || animating) return;
    setPrevTab(activeTab);
    setAnimating(true);
    setTimeout(() => {
      setActiveTab(tab);
      setAnimating(false);
    }, 180); // matches CSS transition duration
  };

  // ── Selection ───────────────────────────────────────────────────────────
  const toggleSelect = (file) =>
    setSelectedFiles((prev) =>
      prev.some((f) => f.file_id === file.file_id)
        ? prev.filter((f) => f.file_id !== file.file_id)
        : [...prev, file],
    );

  const allSelected =
    userFiles.length > 0 && selectedFiles.length === userFiles.length;

  const toggleSelectAll = () =>
    allSelected ? setSelectedFiles([]) : setSelectedFiles([...userFiles]);

  // ── Add files ───────────────────────────────────────────────────────────
  const addFiles = useCallback(
    (incoming) => {
      const MAX = 20 * 1024 * 1024;
      const valid = [],
        rejected = [];
      incoming.forEach((f) => (f.size <= MAX ? valid : rejected).push(f));
      if (rejected.length)
        toast.error(`${rejected.length} file(s) exceed 20MB`);
      if (!valid.length) return;
      setLocalFiles((prev) => [...prev, ...valid]);
      dispatch(
        setFiles([
          ...files,
          ...valid.map((f) => ({ name: f.name, size: f.size, type: f.type })),
        ]),
      );
    },
    [files, dispatch],
  );

  // ── Drag handlers ───────────────────────────────────────────────────────
  const onDragEnter = (e) => {
    e.preventDefault();
    dragCounterRef.current++;
    setDragActive(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    if (--dragCounterRef.current <= 0) {
      setDragActive(false);
      dragCounterRef.current = 0;
    }
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    dragCounterRef.current = 0;
    addFiles(Array.from(e.dataTransfer.files));
  };

  // ── Upload ──────────────────────────────────────────────────────────────
  const uploadWithProgress = (url, file, index) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable)
          dispatch(
            setFileProgress({
              index,
              progress: Math.round((e.loaded / e.total) * 100),
            }),
          );
      };
      xhr.onload = resolve;
      xhr.onerror = reject;
      xhr.send(file);
    });

  const CHUNK_SIZE = 30;
  const CONCURRENCY = 3;
  const MAX_RETRIES = 3;

  const chunkArray = (arr, size) => {
    const res = [];
    for (let i = 0; i < arr.length; i += size) {
      res.push(arr.slice(i, i + size));
    }
    return res;
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // 🔁 RETRY WRAPPER
  const uploadWithRetry = async (fn, retries = MAX_RETRIES) => {
    try {
      return await fn();
    } catch (err) {
      if (retries <= 0) throw err;
      await sleep(1000);
      return uploadWithRetry(fn, retries - 1);
    }
  };

  // 🌍 GLOBAL PROGRESS
  const updateGlobalProgress = (progressMap, setGlobalProgress) => {
    const values = Object.values(progressMap);
    if (!values.length) return;
    const total = values.reduce((a, b) => a + b, 0);
    setGlobalProgress(Math.round(total / values.length));
  };

  // 🚀 MAIN UPLOAD ENGINE
  const handleUpload = async () => {
    if (!localFiles.length) return;

    try {
      setUploading(true);

      const chunks = chunkArray(localFiles, CHUNK_SIZE);
      let fileIndexOffset = 0;

      const queue = [...chunks];

      const worker = async () => {
        while (queue.length) {
          const chunk = queue.shift();
          if (!chunk) break;

          const res = await dispatch(initUpload(chunk)).unwrap();

          const uploaded = [];

          await Promise.all(
            res.files.map((meta, i) => {
              const index = fileIndexOffset + i;
              const file = chunk[i];

              dispatch(setFileStatus({ index, status: "uploading" }));

              return uploadWithRetry(() =>
                uploadWithProgress(meta.upload_url, file, index),
              ).then(() => {
                dispatch(setFileStatus({ index, status: "done" }));

                uploaded.push({
                  file_id: meta.file_id,
                  storage_key: meta.storage_key,
                  filename: meta.filename,
                  size: meta.size,
                });
              });
            }),
          );

          await dispatch(completeUpload(uploaded)).unwrap();

          fileIndexOffset += chunk.length;
        }
      };

      // ⚡ PARALLEL WORKERS
      await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

      toast.success("All files uploaded");
      dispatch(fetchUserFiles());
      setLocalFiles([]);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleShareSelected = async () => {
    if (!selectedFiles.length) return;

    if (!receiver_qr_token) {
      toast.error("No active receiver session");
      return;
    }

    try {
      await dispatch(
        shareFiles({
          qr_token: receiver_qr_token, // ✅ FIXED
          file_ids: selectedFiles.map((f) => f.file_id),
        }),
      ).unwrap();

      toast.success("Files shared");
      setSelectedFiles([]);

      dispatch(resetShareState()); // optional cleanup
    } catch (err) {
      toast.error(err || "Share failed");
    }
  };
  console.log(selectedFiles);

  const hasPending = files.some((_, i) => statusMap[i] !== "done");

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="w-[760px] bg-[#0d0d0d] border border-[#ffffff10] rounded-xl flex flex-col overflow-hidden shadow-2xl"
        style={{ height: "82vh" }} // fixed height — no jump between tabs
        onClick={(e) => e.stopPropagation()}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        {/* ── HEADER ───────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-[#ffffff08] flex justify-between items-center shrink-0">
          <h2 className="text-white text-sm font-medium tracking-tight">
            Manage Files
          </h2>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-md text-[#444] hover:text-white hover:bg-[#1a1a1a] transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── TABS ─────────────────────────────────────────────────────── */}
        <div className="flex border-b border-[#ffffff08] px-6 shrink-0">
          {[
            { id: "files", label: "Your Files", count: userFiles.length },
            { id: "upload", label: "Upload", count: null },
          ].map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => switchTab(id)}
              className={`relative py-3 mr-6 text-xs transition-all duration-200 border-b-2 ${
                activeTab === id
                  ? "text-white border-white"
                  : "text-[#444] border-transparent hover:text-[#777]"
              }`}
            >
              {label}
              {count > 0 && (
                <span
                  className={`ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-mono transition-colors
                  ${activeTab === id ? "bg-[#222] text-[#666]" : "bg-[#111] text-[#333]"}`}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── BODY — fixed height, smooth crossfade between tabs ───────── */}
        <div className="flex-1 overflow-hidden relative">
          {/* FILES TAB */}
          <div
            className="absolute inset-0 overflow-y-auto overflow-x-hidden transition-all duration-200"
            style={{
              opacity: activeTab === "files" && !animating ? 1 : 0,
              transform:
                activeTab === "files" && !animating
                  ? "translateY(0)"
                  : "translateY(4px)",
              pointerEvents: activeTab === "files" ? "auto" : "none",
            }}
          >
            {loadingFiles ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 size={18} className="text-[#222] animate-spin" />
                <p className="text-[#333] text-xs">Loading files...</p>
              </div>
            ) : userFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#111] border border-[#ffffff06] flex items-center justify-center">
                  <File size={18} className="text-[#222]" />
                </div>
                <div className="text-center">
                  <p className="text-[#444] text-sm">No files yet</p>
                  <p className="text-[#2a2a2a] text-xs mt-1">
                    Upload your first file to get started
                  </p>
                </div>
                <button
                  onClick={() => switchTab("upload")}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-medium rounded-lg hover:bg-white/90 transition active:scale-95"
                >
                  <Upload size={12} /> Upload files
                </button>
              </div>
            ) : (
              <>
                {/* SELECTION TOOLBAR */}
                <div className="flex items-center justify-between px-6 py-2.5 border-b border-[#ffffff05] sticky top-0 bg-[#0d0d0d] z-10">
                  {/* Improved select all button */}
                  <button
                    onClick={toggleSelectAll}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 border
                      ${
                        allSelected
                          ? "bg-white/5 border-white/10 text-white"
                          : "bg-transparent border-[#ffffff08] text-[#444] hover:border-[#ffffff15] hover:text-[#777]"
                      }`}
                  >
                    {allSelected ? (
                      <CheckSquare size={12} className="text-white" />
                    ) : (
                      <Square size={12} />
                    )}
                    {allSelected ? "Deselect all" : "Select all"}
                  </button>

                  {selectedFiles.length > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[#444]">
                        {selectedFiles.length} of {userFiles.length} selected
                      </span>
                      <button
                        onClick={handleShareSelected}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-[11px] font-medium rounded-lg hover:bg-white/90 transition active:scale-95"
                      >
                        <Share2 size={11} />
                        Share{" "}
                        {selectedFiles.length > 1
                          ? `${selectedFiles.length}`
                          : ""}
                      </button>
                    </div>
                  )}
                </div>

                {/* FILE GRID */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 p-6">
                  {userFiles.map((file) => (
                    <ExistingFileCard
                      key={file.file_id}
                      file={file}
                      selected={selectedFiles.some(
                        (f) => f.file_id === file.file_id,
                      )}
                      onToggle={() => toggleSelect(file)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* UPLOAD TAB */}
          <div
            className="absolute inset-0 overflow-y-auto overflow-x-hidden transition-all duration-200"
            style={{
              opacity: activeTab === "upload" && !animating ? 1 : 0,
              transform:
                activeTab === "upload" && !animating
                  ? "translateY(0)"
                  : "translateY(4px)",
              pointerEvents: activeTab === "upload" ? "auto" : "none",
            }}
          >
            <div className="p-6 flex flex-col gap-4">
              {/* DROP ZONE */}
              <label
                className={`flex flex-col items-center justify-center gap-4 p-12 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200
                  ${
                    dragActive
                      ? "border-white/25 bg-white/[0.02]"
                      : "border-[#ffffff08] hover:border-[#ffffff15] hover:bg-[#ffffff01]"
                  }`}
              >
                <div
                  className={`p-4 rounded-xl border transition-all duration-200
                  ${dragActive ? "border-white/15 bg-white/8" : "border-[#ffffff06] bg-[#111]"}`}
                >
                  <CloudUpload
                    size={20}
                    className={`transition-colors ${dragActive ? "text-white/70" : "text-[#333]"}`}
                  />
                </div>
                <div className="text-center">
                  <p
                    className={`text-sm transition-colors ${dragActive ? "text-white/70" : "text-[#444]"}`}
                  >
                    {dragActive
                      ? "Drop files to upload"
                      : "Drag & drop files here"}
                  </p>
                  <p className="text-[#2a2a2a] text-xs mt-1">
                    or{" "}
                    <span className="text-[#444] underline underline-offset-2 hover:text-[#666] transition-colors">
                      browse files
                    </span>{" "}
                    · Max 20MB per file
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => addFiles(Array.from(e.target.files))}
                />
              </label>

              {/* QUEUED FILES */}
              {files.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-[#333]">
                      {files.length} file{files.length !== 1 && "s"} queued
                    </p>
                    {!uploading && (
                      <button
                        onClick={() => {
                          setLocalFiles([]);
                          dispatch(setFiles([]));
                        }}
                        className="text-[11px] text-[#333] hover:text-red-400/70 transition"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto">
                    {files.map((file, i) => {
                      const status = statusMap[i];
                      const progress = progressMap[i] || 0;
                      const type = getFileType(file.name);
                      const isDone = status === "done";
                      const isActive = status === "uploading";

                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-300
                            ${isDone ? "border-green-500/15 bg-green-500/[0.04]" : "border-[#ffffff06] bg-[#111]"}`}
                        >
                          {/* TYPE ICON */}
                          <div className="w-7 h-7 rounded-md bg-[#1a1a1a] border border-[#ffffff06] flex items-center justify-center shrink-0">
                            {type === "image" && (
                              <Image size={13} className="text-sky-400/70" />
                            )}
                            {type === "pdf" && (
                              <FileText size={13} className="text-red-400/70" />
                            )}
                            {type === "doc" && (
                              <FileText
                                size={13}
                                className="text-blue-400/70"
                              />
                            )}
                            {(type === "other" || type === "video") && (
                              <File size={13} className="text-[#444]" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <p className="text-[#ccc] text-[11px] truncate">
                                {file.name}
                              </p>
                              <span
                                className={`text-[10px] shrink-0 font-mono ${
                                  isDone
                                    ? "text-green-400/70"
                                    : isActive
                                      ? "text-[#555]"
                                      : "text-[#333]"
                                }`}
                              >
                                {isDone
                                  ? "✓"
                                  : isActive
                                    ? `${progress}%`
                                    : formatSize(file.size)}
                              </span>
                            </div>
                            <div className="h-[1.5px] bg-[#1a1a1a] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${isDone ? "bg-green-500/60" : "bg-white/25"}`}
                                style={{ width: `${isDone ? 100 : progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <div className="px-6 py-3.5 border-t border-[#ffffff06] flex justify-between items-center shrink-0">
          <p className="text-[11px] text-[#2a2a2a] font-mono">
            {activeTab === "files"
              ? selectedFiles.length > 0
                ? `${selectedFiles.length} selected`
                : `${userFiles.length} files`
              : `${files.length} queued`}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-[11px] text-[#333] hover:text-[#666] transition px-2 py-1"
            >
              Cancel
            </button>

            {activeTab === "upload" && files.length > 0 && (
              <WButton
                onClick={handleUpload}
                disabled={!hasPending || uploading}
                text={
                  uploading
                    ? "Uploading..."
                    : `Upload ${files.length > 1 ? `${files.length} files` : "file"}`
                  // exams
                }
              />
            )}

            {activeTab === "files" && selectedFiles.length > 0 && (
              <button
                onClick={handleShareSelected}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-black text-[11px] font-medium rounded-lg hover:bg-white/90 transition active:scale-95"
              >
                <BsSend size={11} />
                Share{" "}
                {selectedFiles.length > 1
                  ? `${selectedFiles.length} files`
                  : "File"}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default UploadModal;
