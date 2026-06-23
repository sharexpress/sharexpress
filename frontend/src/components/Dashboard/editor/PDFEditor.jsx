// editors/pdf/PDFEditor.jsx
// Fetches PDF as blob via presigned URL → renders as local blob URL.
// This bypasses Cloudflare/MinIO X-Frame-Options blocking iframe embedding.

import React, { useEffect, useState, useRef } from "react";
import { X, Download, Loader } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

const PDFEditor = ({ file, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [fetchingBlob, setFetchingBlob] = useState(false);
  const [error, setError] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const blobRef = useRef(null); // keep reference for cleanup

  useEffect(() => {
    const load = async () => {
      try {
        // Step 1: get presigned URL from backend
        const res = await fetch(`${API}/editor/load/${file.file_id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load file metadata");
        const data = await res.json();

        // Step 2: fetch PDF bytes directly (same-origin blob bypasses X-Frame-Options)
        setFetchingBlob(true);
        const pdfRes = await fetch(data.url);
        if (!pdfRes.ok) throw new Error("Failed to fetch PDF from storage");

        const blob = await pdfRes.blob();
        const localUrl = URL.createObjectURL(blob);
        blobRef.current = localUrl;
        setBlobUrl(localUrl);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
        setFetchingBlob(false);
      }
    };

    load();

    return () => {
      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    };
  }, [file.file_id]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#ffffff10] bg-[#0d0d0d] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#f87171] uppercase bg-[#1a0a0a] border border-[#f87171]/20 px-2 py-0.5 rounded font-mono">
            PDF
          </span>
          <p className="text-white text-sm truncate max-w-[400px]">
            {file.filename}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={!blobUrl}
            className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 bg-[#1a1a1a] border border-[#ffffff10] text-[#aaa] hover:text-white hover:border-[#ffffff30] rounded-md transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Download size={12} />
            Download
          </button>
          <button
            onClick={onClose}
            className="text-[#555] hover:text-white transition p-1"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-1 overflow-hidden relative bg-[#111]">
        {(loading || fetchingBlob) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#444]">
            <Loader size={20} className="animate-spin text-[#555]" />
            <span className="text-sm text-[#555]">
              {fetchingBlob ? "Downloading PDF..." : "Loading..."}
            </span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={onClose}
              className="text-xs text-[#555] hover:text-white"
            >
              Close
            </button>
          </div>
        )}

        {/* blob: URL is same-origin → iframe renders without CORS/X-Frame-Options issues */}
        {!loading && blobUrl && (
          <iframe
            src={blobUrl}
            className="w-full h-full border-0"
            title={file.filename}
          />
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-2 border-t border-[#ffffff08] bg-[#0d0d0d] shrink-0">
        <p className="text-[10px] text-[#333] font-mono">
          PDF viewer · annotation editing coming soon
        </p>
      </div>
    </div>
  );
};

export default PDFEditor;
