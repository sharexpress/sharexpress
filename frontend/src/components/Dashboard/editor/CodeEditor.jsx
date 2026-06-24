import React, { useEffect, useState, useRef } from "react";
import { X, Save, RotateCcw, Search, FileText, Check, AlertCircle, Loader, WrapText, ChevronLeft, ChevronRight } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

const CodeEditor = ({ file, onClose }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Versions history state
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [showVersions, setShowVersions] = useState(true);
  const [restoringVersionId, setRestoringVersionId] = useState(null);

  // Find & Replace state
  const [showSearch, setShowSearch] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  // Editor settings
  const [wordWrap, setWordWrap] = useState(true);

  const textareaRef = useRef(null);

  // Fetch file plain-text content and version history
  const fetchFileContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/editor/text/${file.file_id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to load file content");
      }
      const data = await res.json();
      setContent(data.content || "");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    try {
      setLoadingVersions(true);
      const res = await fetch(`${API}/editor/${file.file_id}/versions`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setVersions(data.versions || []);
      }
    } catch (e) {
      console.error("Failed to load version history:", e);
    } finally {
      setLoadingVersions(false);
    }
  };

  useEffect(() => {
    fetchFileContent();
    fetchVersions();
  }, [file.file_id]);

  // Handle Ctrl+S / Cmd+S save shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [content]);

  // Save updated content
  const handleSave = async () => {
    if (saving || loading) return;
    try {
      setSaving(true);
      setSuccessMsg(null);
      setError(null);
      const res = await fetch(`${API}/editor/text/${file.file_id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to save file");
      
      setSuccessMsg(`File saved successfully (Version ${data.version_No})`);
      setTimeout(() => setSuccessMsg(null), 3000);
      
      // Refresh version list
      fetchVersions();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Rollback to specific version
  const handleRollback = async (version) => {
    if (restoringVersionId) return;
    if (!window.confirm(`Are you sure you want to rollback to Version ${version.version_No}?`)) return;

    try {
      setRestoringVersionId(version.version_ID);
      setError(null);
      const res = await fetch(`${API}/editor/${file.file_id}/rollback/${version.version_ID}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to rollback version");

      setSuccessMsg(`Successfully restored Version ${version.version_No}`);
      setTimeout(() => setSuccessMsg(null), 3000);

      // Reload content & versions
      await fetchFileContent();
      await fetchVersions();
    } catch (e) {
      setError(e.message);
    } finally {
      setRestoringVersionId(null);
    }
  };

  // Find & Replace logic
  const handleReplace = () => {
    if (!findText) return;
    const re = new RegExp(findText.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "g");
    setContent((c) => c.replace(re, replaceText));
  };

  // Line numbers generation
  const lineCount = content.split("\n").length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Stats
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col font-sans text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#ffffff10] bg-[#0d0d0d] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#38bdf8] uppercase bg-[#082f49] border border-[#0284c7]/30 px-2 py-0.5 rounded font-mono">
            {file.filename.split(".").pop()}
          </span>
          <h1 className="text-white text-sm font-semibold truncate max-w-[300px]">
            {file.filename}
          </h1>
          {successMsg && (
            <span className="text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
              <Check size={12} />
              {successMsg}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSearch((s) => !s)}
            className={`p-1.5 rounded hover:bg-[#1a1a1a] transition ${showSearch ? "text-[#38bdf8]" : "text-[#8a8a8a]"}`}
            title="Find & Replace"
          >
            <Search size={16} />
          </button>
          
          <button
            onClick={() => setWordWrap((w) => !w)}
            className={`p-1.5 rounded hover:bg-[#1a1a1a] transition ${wordWrap ? "text-[#38bdf8]" : "text-[#8a8a8a]"}`}
            title="Toggle Word Wrap"
          >
            <WrapText size={16} />
          </button>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 bg-[#38bdf8] text-black font-semibold rounded hover:bg-[#0ea5e9] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader size={12} className="animate-spin" /> : <Save size={12} />}
            Save
          </button>

          <button
            onClick={() => setShowVersions((sv) => !sv)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-[#171717] border border-[#ffffff10] text-[#aaa] hover:text-white rounded hover:border-[#ffffff20]"
          >
            {showVersions ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            Versions
          </button>

          <button onClick={onClose} className="text-[#555] hover:text-white transition p-1 ml-2">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Find / Replace bar */}
      {showSearch && (
        <div className="flex items-center gap-3 px-5 py-2.5 bg-[#0f0f0f] border-b border-[#ffffff08] shrink-0 text-xs text-[#aaa]">
          <input
            type="text"
            placeholder="Find text..."
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            className="px-2.5 py-1 bg-[#1a1a1a] border border-[#ffffff10] rounded text-white focus:outline-none focus:border-[#38bdf8]"
          />
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            className="px-2.5 py-1 bg-[#1a1a1a] border border-[#ffffff10] rounded text-white focus:outline-none focus:border-[#38bdf8]"
          />
          <button
            onClick={handleReplace}
            className="px-3 py-1 bg-[#262626] border border-[#ffffff10] text-white hover:bg-[#333] rounded transition"
          >
            Replace All
          </button>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 flex overflow-hidden relative bg-[#080808]">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#080808] z-10">
              <Loader size={20} className="animate-spin text-[#38bdf8]" />
              <span className="text-xs text-[#555]">Loading file content...</span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#080808] z-10 px-6 text-center">
              <AlertCircle size={24} className="text-red-500" />
              <p className="text-sm text-red-400 max-w-[400px]">{error}</p>
              <button
                onClick={fetchFileContent}
                className="px-4 py-1.5 bg-[#171717] border border-[#ffffff10] text-xs rounded hover:text-white hover:border-[#ffffff20]"
              >
                Retry
              </button>
            </div>
          )}

          {/* Line Numbers Sidebar */}
          <div className="py-4 select-none border-r border-[#ffffff05] bg-[#050505] text-right pr-3 pl-4 text-[#333] font-mono text-xs leading-6 overflow-hidden min-w-[40px]">
            {lineNumbers.map((ln) => (
              <div key={ln}>{ln}</div>
            ))}
          </div>

          {/* Main Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`flex-1 p-4 bg-transparent text-white font-mono text-xs leading-6 border-none outline-none resize-none focus:ring-0 overflow-y-auto ${wordWrap ? "whitespace-pre-wrap" : "whitespace-pre overflow-x-auto"}`}
            placeholder="Start typing your file content..."
            disabled={loading || error}
          />
        </div>

        {/* Versions Sidebar */}
        {showVersions && (
          <div className="w-[300px] border-l border-[#ffffff10] bg-[#0c0c0c] flex flex-col shrink-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-[#ffffff08] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8a8a8a] uppercase tracking-wider">Version History</span>
              <span className="text-[10px] text-[#444] font-mono bg-[#171717] px-1.5 py-0.5 rounded">
                Max 10
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {loadingVersions && versions.length === 0 && (
                <div className="flex justify-center py-8">
                  <Loader size={16} className="animate-spin text-[#38bdf8]" />
                </div>
              )}

              {!loadingVersions && versions.length === 0 && (
                <p className="text-[11px] text-[#444] text-center py-6 font-mono">No edit history recorded yet</p>
              )}

              {versions.map((v, i) => (
                <div
                  key={v.version_ID}
                  className={`p-3 bg-[#121212] border rounded-lg flex flex-col gap-2 transition hover:bg-[#161616] ${i === 0 ? "border-[#38bdf8]/30 bg-[#38bdf8]/5" : "border-[#ffffff08]"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#e5e7eb]">
                      Version {v.version_No} {i === 0 && <span className="text-[9px] text-[#38bdf8] bg-[#0c2f49] border border-[#0284c7]/20 px-1 py-0.2 rounded ml-1.5">Latest</span>}
                    </span>
                    <span className="text-[9px] font-mono text-[#555] bg-[#1a1a1a] px-1 py-0.5 rounded capitalize">
                      {v.editedBy}
                    </span>
                  </div>

                  <div className="text-[10px] text-[#666] font-mono flex justify-between items-center">
                    <span>{new Date(v.createdAt).toLocaleDateString()} at {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {i > 0 && (
                    <button
                      onClick={() => handleRollback(v)}
                      disabled={restoringVersionId !== null}
                      className="mt-1.5 py-1 bg-[#1a1a1a] border border-[#ffffff08] hover:border-white/30 text-white font-medium text-[10px] rounded flex items-center justify-center gap-1 transition disabled:opacity-40"
                    >
                      {restoringVersionId === v.version_ID ? (
                        <Loader size={10} className="animate-spin" />
                      ) : (
                        <RotateCcw size={10} />
                      )}
                      Restore this version
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Editor Status Bar */}
      <div className="px-5 py-2 border-t border-[#ffffff08] bg-[#0d0d0d] flex justify-between items-center shrink-0 text-[10px] text-[#555] font-mono">
        <div className="flex gap-4">
          <span>{lineCount} lines</span>
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
        <div>
          <span>Press <kbd className="bg-[#1a1a1a] px-1 py-0.2 rounded border border-[#333] text-[#777]">⌘S</kbd> to save changes</span>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
