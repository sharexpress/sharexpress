import React, { useState, memo } from "react";
import { Download, Trash2, MoreVertical } from "lucide-react";
import useInViewUrl, { getFileType } from "../../helpers/Useinviewurl";
import PreviewThumbnail from "./Previewthumbnail";
import PreviewModal from "./Previewmodal";
import EditorRouter from "../Dashboard/editor/Editorrouter";

import { Pencil } from "lucide-react";

const EDITABLE_TYPES = ["pdf", "doc", "docx", "txt", "md", "html", "json", "csv"];

const formatSize = (size) => {
  if (!size) return "0 B";
  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
  return (size / (1024 * 1024)).toFixed(1) + " MB";
};

const FileCard = memo(({ file, onDownload, onDelete, view }) => {
  const [editOpen, setEditOpen] = useState(false);

  const type = getFileType(file?.filename);
  const { ref, url, loading, error, retry } = useInViewUrl(file);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCardClick = () => {
    if (url) setModalOpen(true);
  };

  // ================= GRID VIEW =================
  if (view === "grid") {
    return (
      <>
        <div
          ref={ref}
          className="group bg-[#171717] border border-[#ffffff10] rounded-xl overflow-hidden hover:border-white/30 hover:shadow-lg hover:shadow-black/30 cursor-pointer"
          onClick={handleCardClick}
        >
          <div className="h-[160px] bg-[#0f0f0f] flex items-center justify-center overflow-hidden relative">
            <PreviewThumbnail
              type={type}
              url={url}
              filename={file.filename}
              size="full"
              loading={loading}
              error={error}
              onRetry={retry}
            />

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
              <Download
                size={18}
                className="text-white hover:scale-110 cursor-pointer transition"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload({ ...file, download_url: url });
                }}
              />
              {EDITABLE_TYPES.includes(type) && (
                <Pencil
                  size={18}
                  className="text-white hover:scale-110 cursor-pointer transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditOpen(true);
                  }}
                />
              )}
              <Trash2
                size={18}
                className="text-red-400 hover:scale-110 cursor-pointer transition"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(file.file_id);
                }}
              />
            </div>

            <div className="absolute bottom-2 right-2 bg-black/60 text-[10px] px-2 py-[2px] rounded text-white uppercase pointer-events-none">
              {type}
            </div>
          </div>

          <div className="p-3">
            <p className="text-white text-sm break-words leading-tight line-clamp-2">
              {file.filename}
            </p>
            <div className="flex justify-between items-center mt-2">
              <p className="text-[11px] text-[#6a6a6a]">
                {formatSize(file.size)}
              </p>
            </div>
          </div>
        </div>

        {modalOpen && (
          <PreviewModal
            file={file}
            url={url}
            type={type}
            onClose={() => setModalOpen(false)}
            onDownload={onDownload}
          />
        )}
      </>
    );
  }

  // ================= LIST VIEW =================
  return (
    <>
      <div
        ref={ref}
        className="group flex items-center justify-between px-4 py-3 border-b border-[#ffffff08] hover:bg-[#1a1a1a] cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex items-center gap-4 w-[55%] min-w-0">
          <div className="w-10 h-10 rounded-md bg-[#111] flex items-center justify-center overflow-hidden shrink-0">
            <PreviewThumbnail
              type={type}
              url={url}
              filename={file.filename}
              size="small"
              loading={loading}
              error={error}
              onRetry={retry}
            />
          </div>
          <p className="text-white text-sm truncate flex-1">{file.filename}</p>
        </div>

        <div className="text-[#7a7a7a] text-xs w-[90px] text-left">
          {formatSize(file.size)}
        </div>
        <div className="text-[#5a5a5a] text-[11px] w-[80px] uppercase">
          {type}
        </div>

        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <Download
            size={16}
            className="text-[#8a8a8a] hover:text-white cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDownload({ ...file, download_url: url });
            }}
          />
          {EDITABLE_TYPES.includes(type) && (
            <Pencil
              size={16}
              className="text-[#8a8a8a] hover:text-white cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setEditOpen(true);
              }}
            />
          )}
          <Trash2
            size={16}
            className="text-red-400 hover:text-red-300 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(file.file_id);
            }}
          />
          <MoreVertical
            size={16}
            className="text-[#8a8a8a] hover:text-white cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      {modalOpen && (
        <PreviewModal
          file={file}
          url={url}
          type={type}
          onClose={() => setModalOpen(false)}
          onDownload={onDownload}
        />
      )}

      {editOpen && (
        <EditorRouter file={file} onClose={() => setEditOpen(false)} />
      )}
    </>
  );
});

FileCard.displayName = "FileCard";
export default FileCard;
