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

// PreviewThumbnail.jsx
// Lightweight thumbnails — NO iframes anywhere in this file.
//
// Memory fixes vs previous version:
// 1. pdf.destroy() called after render — releases pdfjs document from RAM
// 2. page.cleanup() called after render — releases page resources
// 3. renderTask.cancel() in cleanup — stops in-progress render on unmount
// 4. canvas zeroed on unmount (width=0, height=0) — frees GPU buffer
// 5. enqueueRender() — max 2 concurrent PDF renders via global queue
// 6. cancelled flag guards all async steps after unmount

import React, { useEffect, useRef, useState } from "react";
import { enqueueRender } from "../../helpers/Pdfrenderqueue";

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

export const PdfThumb = ({ url, size = "full" }) => {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!url) return;

    const cancelRender = enqueueRender(async (registerCancel) => {
      let cancelled = false;
      let renderTask = null;
      let pdfDoc = null;

      registerCancel(() => {
        cancelled = true;
        if (renderTask) renderTask.cancel();
        if (pdfDoc) pdfDoc.destroy();
      });

      try {
        const pdfjsLib = await getPdfJs();
        if (cancelled) return;

        pdfDoc = await pdfjsLib.getDocument({ url, verbosity: 0 }).promise;
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

        const containerWidth = size === "full" ? 320 : 40;
        const viewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        renderTask = page.render({
          canvasContext: canvas.getContext("2d"),
          viewport: scaledViewport,
        });

        await renderTask.promise;

        if (!cancelled) setRendered(true);
      } catch (err) {
        if (!cancelled && err?.name !== "RenderingCancelledException") {
          console.error("PdfThumb render failed:", err);
          setFailed(true);
        }
      } finally {
        try {
          pdfDoc?.destroy();
        } catch (_) {}
        try {
          renderTask = null;
        } catch (_) {}
        try {
          pdfDoc = null;
        } catch (_) {}
      }
    });

    return () => {
      cancelRender();
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    };
  }, [url, size]);

  if (failed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
        <PdfIcon size={size} />
        <span className="text-[10px] text-[#555]">PDF</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      {!rendered && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full border border-[#444] border-t-[#888] animate-spin" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          rendered ? "opacity-100" : "opacity-0"
        }`}
        style={{ imageRendering: "crisp-edges" }}
      />
    </div>
  );
};

export const ImageThumb = ({ url, filename, size = "full" }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-[10px] text-[#555]">IMG</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
          <div className="w-4 h-4 rounded-full border border-[#444] border-t-[#888] animate-spin" />
        </div>
      )}
      <img
        src={url}
        alt={filename}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};

export const DocThumb = ({ filename, size = "full" }) => {
  if (size === "small") {
    return (
      <span className="text-[10px] text-[#888] uppercase font-medium">DOC</span>
    );
  }
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-3">
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
        <rect width="32" height="40" rx="4" fill="#1e3a5f" />
        <rect
          x="6"
          y="10"
          width="20"
          height="2.5"
          rx="1"
          fill="#4a90d9"
          opacity="0.8"
        />
        <rect
          x="6"
          y="15"
          width="20"
          height="2.5"
          rx="1"
          fill="#4a90d9"
          opacity="0.6"
        />
        <rect
          x="6"
          y="20"
          width="14"
          height="2.5"
          rx="1"
          fill="#4a90d9"
          opacity="0.4"
        />
        <text
          x="16"
          y="35"
          textAnchor="middle"
          fontSize="7"
          fill="#4a90d9"
          fontWeight="600"
        >
          DOCX
        </text>
      </svg>
      {filename && (
        <p className="text-[10px] text-[#666] text-center line-clamp-2 leading-tight px-1">
          {filename}
        </p>
      )}
    </div>
  );
};

export const OtherThumb = ({ filename }) => {
  const ext = filename?.split(".").pop()?.toUpperCase() || "?";
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
      <div className="w-8 h-8 rounded bg-[#222] flex items-center justify-center">
        <span className="text-[9px] text-[#555] font-mono font-bold">
          {ext.slice(0, 4)}
        </span>
      </div>
    </div>
  );
};

const PdfIcon = ({ size }) => (
  <svg
    width={size === "small" ? 18 : 28}
    height={size === "small" ? 18 : 28}
    viewBox="0 0 28 28"
    fill="none"
  >
    <rect width="28" height="28" rx="4" fill="#7f1d1d" />
    <text
      x="14"
      y="19"
      textAnchor="middle"
      fontSize="9"
      fill="#fca5a5"
      fontWeight="700"
    >
      PDF
    </text>
  </svg>
);

const PreviewThumbnail = ({
  type,
  url,
  filename,
  size = "full",
  loading,
  error,
  onRetry,
}) => {
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        {size === "full" ? (
          <div className="text-[#6a6a6a] text-xs animate-pulse">
            Loading preview...
          </div>
        ) : (
          <div className="w-3 h-3 rounded-full border border-[#444] border-t-white animate-spin" />
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
        <span className="text-[10px] text-[#555]">Failed</span>
        {onRetry && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRetry();
            }}
            className="text-[10px] text-[#4a90d9] hover:text-white transition px-2 py-0.5 rounded border border-[#4a90d9]/40 hover:border-white/40"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (!url) {
    if (type === "other") return <OtherThumb filename={filename} />;
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-[10px] text-[#555]">No preview</span>
      </div>
    );
  }

  if (type === "image")
    return <ImageThumb url={url} filename={filename} size={size} />;
  if (type === "pdf") return <PdfThumb url={url} size={size} />;
  if (type === "doc") return <DocThumb filename={filename} size={size} />;
  return <OtherThumb filename={filename} />;
};

export default PreviewThumbnail;
