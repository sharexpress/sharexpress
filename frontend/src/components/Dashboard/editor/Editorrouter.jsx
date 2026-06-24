import React from "react";
import PDFEditor from "./PDFEditor";
import DocxEditor from "./Docxeditor";
import CodeEditor from "./CodeEditor";

const getExt = (filename) => filename?.split(".").pop().toLowerCase();

const EditorRouter = ({ file, onClose }) => {
  if (!file) return null;
  const ext = getExt(file.filename);

  const textExtensions = ["txt", "md", "html", "json", "csv"];

  if (ext === "pdf") return <PDFEditor file={file} onClose={onClose} />;
  if (ext === "docx" || ext === "doc")
    return <DocxEditor file={file} onClose={onClose} />;
  if (textExtensions.includes(ext))
    return <CodeEditor file={file} onClose={onClose} />;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-[#111] border border-[#ffffff15] rounded-xl p-8 text-center">
        <p className="text-[#555] text-sm font-mono">
          .{ext} files are not supported for editing
        </p>
        <button
          onClick={onClose}
          className="mt-4 text-xs text-[#444] hover:text-white transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default EditorRouter;
