// editors/docx/DocxEditor.jsx
// Google Docs-inspired editor — A4 page canvas, full ribbon toolbar,
// per-paragraph styling, Ctrl+S, word count, find & replace, line height, color.

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  X,
  Save,
  Loader,
  Check,
  Plus,
  Trash2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ZoomIn,
  ZoomOut,
  FileText,
  ChevronDown,
  AlertCircle,
  Strikethrough,
  List,
  ListOrdered,
  Undo,
  Redo,
  Search,
  Printer,
  MoreHorizontal,
  Link,
  Indent,
  Outdent,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const FONT_SIZES = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 48, 72,
];
const FONTS = [
  "Arial",
  "Calibri",
  "Cambria",
  "Comic Sans MS",
  "Consolas",
  "Courier New",
  "Garamond",
  "Georgia",
  "Helvetica",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
];
const ZOOM_LEVELS = [50, 75, 90, 100, 110, 125, 150, 175, 200];
const LINE_HEIGHTS = [
  { label: "Single", value: 1.15 },
  { label: "1.15", value: 1.15 },
  { label: "1.5", value: 1.5 },
  { label: "Double", value: 2 },
];
const HEADING_STYLES = [
  { label: "Normal text", font_size: 11, bold: false, font: "Arial" },
  { label: "Heading 1", font_size: 20, bold: true, font: "Arial" },
  { label: "Heading 2", font_size: 16, bold: true, font: "Arial" },
  { label: "Heading 3", font_size: 14, bold: true, font: "Arial" },
  { label: "Title", font_size: 26, bold: true, font: "Arial" },
  {
    label: "Subtitle",
    font_size: 15,
    bold: false,
    italic: true,
    font: "Arial",
  },
];
const TEXT_COLORS = [
  "#000000",
  "#434343",
  "#666666",
  "#999999",
  "#b7b7b7",
  "#cccccc",
  "#d9d9d9",
  "#ffffff",
  "#ff0000",
  "#ff4500",
  "#ff9900",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#4a86e8",
  "#9900ff",
  "#ff00ff",
  "#e6b8a2",
  "#f4cccc",
  "#fce5cd",
  "#fff2cc",
  "#d9ead3",
  "#d0e0e3",
  "#c9daf8",
  "#1a1a1a",
  "#c00000",
  "#e69138",
  "#f1c232",
  "#6aa84f",
  "#45818e",
  "#3c78d8",
  "#674ea7",
];

const EMPTY_PARA = {
  text: "",
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  font_size: 11,
  font: "Arial",
  align: "left",
  color: "#000000",
  line_height: 1.5,
  indent: 0,
};

// ── History manager ──────────────────────────────────────────────────────────
function useHistory(initial) {
  const [stack, setStack] = useState([initial]);
  const [idx, setIdx] = useState(0);

  const push = useCallback(
    (state) => {
      setStack((s) => {
        const trimmed = s.slice(0, idx + 1);
        return [...trimmed, state].slice(-50);
      });
      setIdx((i) => Math.min(i + 1, 49));
    },
    [idx],
  );

  const undo = useCallback(() => {
    setIdx((i) => Math.max(0, i - 1));
    return stack[Math.max(0, idx - 1)];
  }, [stack, idx]);

  const redo = useCallback(() => {
    setIdx((i) => Math.min(stack.length - 1, i + 1));
    return stack[Math.min(stack.length - 1, idx + 1)];
  }, [stack, idx]);

  return {
    push,
    undo,
    redo,
    canUndo: idx > 0,
    canRedo: idx < stack.length - 1,
  };
}

// ── Tooltip ──────────────────────────────────────────────────────────────────
const Tooltip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && text && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#3c4043",
            color: "#fff",
            fontSize: 11,
            padding: "4px 8px",
            borderRadius: 4,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};

// ── Toolbar button ───────────────────────────────────────────────────────────
const ToolBtn = ({ active, onClick, children, title, disabled }) => (
  <Tooltip text={title}>
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 28,
        minWidth: 28,
        padding: "0 5px",
        borderRadius: 4,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: active ? "#c2d7f5" : "transparent",
        color: active ? "#1a4080" : disabled ? "#aaa" : "#3c4043",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => {
        if (!disabled && !active) e.currentTarget.style.background = "#e8eaed";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = active ? "#c2d7f5" : "transparent";
      }}
    >
      {children}
    </button>
  </Tooltip>
);

const Sep = () => (
  <div
    style={{
      width: 1,
      height: 20,
      background: "#dadce0",
      margin: "0 4px",
      flexShrink: 0,
    }}
  />
);

// ── Generic dropdown ─────────────────────────────────────────────────────────
const Dropdown = ({
  value,
  options,
  onChange,
  width = 112,
  label,
  renderOption,
  renderValue,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", width }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          height: 28,
          padding: "0 6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fff",
          border: "1px solid #dadce0",
          borderRadius: 4,
          fontSize: 12,
          color: "#3c4043",
          cursor: "pointer",
          gap: 4,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f8f9fa";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#fff";
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            textAlign: "left",
            fontFamily: label === "font" ? value : "inherit",
          }}
        >
          {renderValue ? renderValue(value) : value}
        </span>
        <ChevronDown size={10} style={{ color: "#80868b", flexShrink: 0 }} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 2px)",
            left: 0,
            minWidth: "100%",
            background: "#fff",
            border: "1px solid #dadce0",
            borderRadius: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            zIndex: 1000,
            maxHeight: 240,
            overflowY: "auto",
          }}
        >
          {options.map((opt, i) => {
            const optVal = typeof opt === "object" ? opt.value : opt;
            const optLabel = typeof opt === "object" ? opt.label : opt;
            const isActive = String(value) === String(optVal);
            return (
              <button
                key={i}
                onClick={() => {
                  onChange(optVal);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  padding: "6px 12px",
                  textAlign: "left",
                  fontSize: 13,
                  border: "none",
                  cursor: "pointer",
                  background: isActive ? "#e8f0fe" : "transparent",
                  color: isActive ? "#1a73e8" : "#3c4043",
                  fontFamily: label === "font" ? String(optVal) : "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "#f8f9fa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isActive
                    ? "#e8f0fe"
                    : "transparent";
                }}
              >
                {renderOption ? renderOption(opt) : optLabel}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Color picker popover ─────────────────────────────────────────────────────
const ColorPicker = ({ value, onChange, label }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <Tooltip text={label}>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            height: 28,
            width: 28,
            borderRadius: 4,
            border: "none",
            cursor: "pointer",
            background: "transparent",
            padding: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#e8eaed";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#3c4043",
              lineHeight: 1,
            }}
          >
            A
          </span>
          <div
            style={{
              width: 18,
              height: 3,
              background: value || "#000",
              borderRadius: 1,
              marginTop: 1,
            }}
          />
        </button>
      </Tooltip>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            background: "#fff",
            border: "1px solid #dadce0",
            borderRadius: 6,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            zIndex: 1000,
            padding: 10,
            width: 180,
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: "#80868b",
              margin: "0 0 6px",
              fontWeight: 500,
            }}
          >
            Text color
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(8, 1fr)",
              gap: 3,
            }}
          >
            {TEXT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                style={{
                  width: 18,
                  height: 18,
                  background: c,
                  border:
                    value === c ? "2px solid #1a73e8" : "1px solid #dadce0",
                  borderRadius: 2,
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 8,
            }}
          >
            <span style={{ fontSize: 11, color: "#80868b" }}>Custom</span>
            <input
              type="color"
              value={value || "#000000"}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: 28,
                height: 22,
                padding: 0,
                border: "1px solid #dadce0",
                borderRadius: 2,
                cursor: "pointer",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ── Find & Replace panel ────────────────────────────────────────────────────
const FindReplace = ({ paragraphs, onReplace, onClose }) => {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [count, setCount] = useState(0);

  const findCount = useMemo(() => {
    if (!find) return 0;
    return paragraphs.reduce((acc, p) => {
      const matches = (p.text || "").split(find).length - 1;
      return acc + matches;
    }, 0);
  }, [find, paragraphs]);

  const handleReplace = () => {
    if (!find) return;
    onReplace(find, replace);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        background: "#fff",
        border: "1px solid #dadce0",
        borderRadius: 8,
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        padding: 12,
        zIndex: 100,
        width: 300,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: "#3c4043" }}>
          Find & replace
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#80868b",
            padding: 2,
          }}
        >
          <X size={14} />
        </button>
      </div>
      <input
        placeholder="Find"
        value={find}
        onChange={(e) => setFind(e.target.value)}
        style={{
          width: "100%",
          height: 32,
          padding: "0 8px",
          border: "1px solid #dadce0",
          borderRadius: 4,
          fontSize: 13,
          marginBottom: 6,
          boxSizing: "border-box",
          color: "#3c4043",
        }}
      />
      {find && (
        <p style={{ fontSize: 11, color: "#80868b", margin: "-2px 0 6px" }}>
          {findCount} match{findCount !== 1 ? "es" : ""}
        </p>
      )}
      <input
        placeholder="Replace with"
        value={replace}
        onChange={(e) => setReplace(e.target.value)}
        style={{
          width: "100%",
          height: 32,
          padding: "0 8px",
          border: "1px solid #dadce0",
          borderRadius: 4,
          fontSize: 13,
          marginBottom: 8,
          boxSizing: "border-box",
          color: "#3c4043",
        }}
      />
      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
        <button
          onClick={handleReplace}
          disabled={!find || findCount === 0}
          style={{
            padding: "5px 12px",
            fontSize: 12,
            borderRadius: 4,
            cursor: findCount ? "pointer" : "not-allowed",
            background: findCount ? "#1a73e8" : "#e8eaed",
            color: findCount ? "#fff" : "#aaa",
            border: "none",
            fontWeight: 500,
          }}
        >
          Replace all
        </button>
      </div>
    </div>
  );
};

// ── Single paragraph ─────────────────────────────────────────────────────────
const Para = ({
  para,
  index,
  isActive,
  onFocus,
  onChange,
  onDelete,
  onKeyDown,
  zoom,
}) => {
  const textareaRef = useRef(null);

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, []);

  useEffect(() => {
    resize();
  }, [para.text, para.font_size, zoom, resize]);

  const scaledSize = (para.font_size || 11) * (zoom / 100);
  const indentPx = (para.indent || 0) * 36 * (zoom / 100);

  return (
    <div
      style={{ position: "relative", paddingLeft: indentPx }}
      onClick={() => onFocus(index)}
    >
      {/* Delete icon — appears on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(index);
        }}
        style={{
          position: "absolute",
          left: indentPx - 28,
          top: 4,
          width: 20,
          height: 20,
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: "#ea4335",
          opacity: 0,
          transition: "opacity 0.15s",
        }}
        className="para-delete-btn"
        title="Delete paragraph"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#fce8e6";
          e.currentTarget.style.opacity = 1;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.opacity = 0;
        }}
      >
        <Trash2 size={11} />
      </button>

      {/* Active cursor line */}
      {isActive && (
        <div
          style={{
            position: "absolute",
            left: indentPx - 4,
            top: 2,
            bottom: 2,
            width: 2,
            background: "#1a73e8",
            borderRadius: 1,
          }}
        />
      )}

      <textarea
        ref={textareaRef}
        value={para.text}
        onChange={(e) => {
          onChange(index, { ...para, text: e.target.value });
          resize();
        }}
        onFocus={() => onFocus(index)}
        onKeyDown={(e) => onKeyDown(e, index)}
        onInput={resize}
        placeholder={index === 0 ? "Start typing…" : ""}
        rows={1}
        style={{
          width: "100%",
          resize: "none",
          outline: "none",
          border: "none",
          background: "transparent",
          padding: 0,
          margin: 0,
          fontFamily: para.font || "Arial",
          fontSize: `${scaledSize}pt`,
          fontWeight: para.bold ? "700" : "400",
          fontStyle: para.italic ? "italic" : "normal",
          textDecoration:
            [
              para.underline && "underline",
              para.strikethrough && "line-through",
            ]
              .filter(Boolean)
              .join(" ") || "none",
          textAlign: para.align || "left",
          color: para.color || "#000",
          lineHeight: para.line_height || 1.5,
          overflow: "hidden",
          minHeight: `${scaledSize * 1.33 * (para.line_height || 1.5) * 1.1}px`,
          caretColor: "#1a73e8",
          wordBreak: "break-word",
        }}
      />
    </div>
  );
};

// ── Zoom selector ─────────────────────────────────────────────────────────────
const ZoomControl = ({ zoom, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          height: 28,
          padding: "0 8px",
          background: "transparent",
          border: "1px solid transparent",
          borderRadius: 4,
          fontSize: 12,
          color: "#3c4043",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#e8eaed";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        {zoom}%
        <ChevronDown size={10} style={{ color: "#80868b" }} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 4px)",
            right: 0,
            background: "#fff",
            border: "1px solid #dadce0",
            borderRadius: 6,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            zIndex: 100,
            overflow: "hidden",
          }}
        >
          {ZOOM_LEVELS.map((z) => (
            <button
              key={z}
              onClick={() => {
                onChange(z);
                setOpen(false);
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "6px 20px",
                fontSize: 13,
                textAlign: "left",
                border: "none",
                cursor: "pointer",
                background: zoom === z ? "#e8f0fe" : "transparent",
                color: zoom === z ? "#1a73e8" : "#3c4043",
              }}
              onMouseEnter={(e) => {
                if (zoom !== z) e.currentTarget.style.background = "#f8f9fa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  zoom === z ? "#e8f0fe" : "transparent";
              }}
            >
              {z}%
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Pagination engine ─────────────────────────────────────────────────────────
// Distributes paragraphs into pages by measuring their rendered heights.
// Each page has a fixed content height (A4 minus top+bottom padding).
// A paragraph that is taller than a full page gets its own page.
const usePagination = (paragraphs, pageContentH, paraHeights) => {
  return useMemo(() => {
    if (!pageContentH || paraHeights.length === 0) {
      return [paragraphs.map((_, i) => i)];
    }
    const pages = [];
    let currentPage = [];
    let usedH = 0;
    paragraphs.forEach((_, i) => {
      const h = paraHeights[i] ?? 0;
      if (currentPage.length > 0 && usedH + h > pageContentH) {
        pages.push(currentPage);
        currentPage = [i];
        usedH = h;
      } else {
        currentPage.push(i);
        usedH += h;
      }
    });
    if (currentPage.length > 0) pages.push(currentPage);
    return pages.length ? pages : [[]];
  }, [paragraphs, pageContentH, paraHeights]);
};

// ── Page component ────────────────────────────────────────────────────────────
const Page = ({
  pageNumber,
  totalPages,
  paraIndices,
  paragraphs,
  activeIdx,
  setActiveIdx,
  updateParagraph,
  deleteParagraph,
  handleKeyDown,
  zoom,
  pageW,
  padV,
  padH,
  pageContentH,
  onParaHeightChange,
}) => {
  const rowRefs = useRef({});

  // Measure each paragraph's rendered height after paint
  useEffect(() => {
    paraIndices.forEach((pi) => {
      const el = rowRefs.current[pi];
      if (el) onParaHeightChange(pi, el.getBoundingClientRect().height);
    });
  });

  return (
    <div
      style={{
        width: pageW,
        minHeight: Math.round((1123 * zoom) / 100),
        background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 2px 16px rgba(0,0,0,0.08)",
        padding: `${padV}px ${padH}px`,
        boxSizing: "border-box",
        position: "relative",
        borderRadius: 2,
        flexShrink: 0,
      }}
    >
      {/* Top accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background:
            "linear-gradient(90deg, transparent, #1a73e820 30%, #1a73e820 70%, transparent)",
          borderRadius: "2px 2px 0 0",
        }}
      />

      {/* Paragraphs */}
      <div style={{ paddingLeft: 24, position: "relative" }}>
        {paraIndices.map((pi) => (
          <div
            key={pi}
            ref={(el) => {
              rowRefs.current[pi] = el;
            }}
          >
            <Para
              para={paragraphs[pi]}
              index={pi}
              isActive={activeIdx === pi}
              onFocus={setActiveIdx}
              onChange={updateParagraph}
              onDelete={deleteParagraph}
              onKeyDown={handleKeyDown}
              zoom={zoom}
            />
          </div>
        ))}
      </div>

      {/* Page number footer */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <span
          style={{ fontSize: 10, color: "#bdc1c6", fontFamily: "monospace" }}
        >
          {pageNumber} of {totalPages}
        </span>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const DocxEditor = ({ file, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [storageKey, setStorageKey] = useState(null);
  const [paragraphs, setParagraphs] = useState([{ ...EMPTY_PARA }]);
  const [dirty, setDirty] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [showFind, setShowFind] = useState(false);
  // paraHeights[i] = measured pixel height of paragraph i
  const [paraHeights, setParaHeights] = useState([]);
  const history = useHistory([{ ...EMPTY_PARA }]);

  const active = paragraphs[activeIdx] ?? EMPTY_PARA;

  // A4 page dimensions scaled by zoom
  const pageW = Math.round((794 * zoom) / 100);
  const padV = Math.round((96 * zoom) / 100);
  const padH = Math.round((76 * zoom) / 100);
  const a4H = Math.round((1123 * zoom) / 100);
  const pageContentH = a4H - padV * 2 - 32;

  const handleParaHeightChange = useCallback((index, h) => {
    setParaHeights((prev) => {
      if (prev[index] === h) return prev;
      const next = [...prev];
      next[index] = h;
      return next;
    });
  }, []);

  const pages = usePagination(paragraphs, pageContentH, paraHeights);

  const activePage = useMemo(() => {
    return pages.findIndex((pg) => pg.includes(activeIdx)) + 1;
  }, [pages, activeIdx]);

  const stats = useMemo(
    () => ({
      words: paragraphs.reduce(
        (a, p) => a + (p.text?.trim().split(/\s+/).filter(Boolean).length || 0),
        0,
      ),
      chars: paragraphs.reduce((a, p) => a + (p.text?.length || 0), 0),
    }),
    [paragraphs],
  );

  // ── Load ────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const metaRes = await fetch(`${API}editor/load/${file.file_id}`, {
          credentials: "include",
        });
        if (!metaRes.ok) throw new Error("Failed to load file");
        const meta = await metaRes.json();
        setStorageKey(meta.storage_key);
        const contentRes = await fetch(
          `${API}editor/docx/${file.file_id}/content?storage_key=${encodeURIComponent(meta.storage_key)}`,
          { credentials: "include" },
        );
        if (!contentRes.ok) throw new Error("Failed to parse document");
        const { paragraphs: paras } = await contentRes.json();
        const normalized = (paras || []).map((p) => ({
          ...EMPTY_PARA,
          text: p.text || "",
          bold: !!p.bold,
          italic: !!p.italic,
          underline: !!p.underline,
          strikethrough: !!p.strikethrough,
          font_size: p.font_size || 11,
          font: p.font || "Arial",
          align: p.align || "left",
          color: p.color || "#000000",
          line_height: p.line_height || 1.5,
          indent: p.indent || 0,
        }));
        const loaded = normalized.length ? normalized : [{ ...EMPTY_PARA }];
        setParagraphs(loaded);
        history.push(loaded);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [file.file_id]);

  // ── Update helpers ───────────────────────────────────────────────
  const updateActive = useCallback(
    (patch) => {
      setParagraphs((prev) => {
        const next = prev.map((p, i) =>
          i === activeIdx ? { ...p, ...patch } : p,
        );
        history.push(next);
        return next;
      });
      setDirty(true);
      setSaved(false);
    },
    [activeIdx, history],
  );

  const updateParagraph = useCallback((index, updated) => {
    setParagraphs((prev) => {
      const next = prev.map((p, i) => (i === index ? updated : p));
      return next;
    });
    setDirty(true);
    setSaved(false);
  }, []);

  const deleteParagraph = useCallback(
    (index) => {
      if (paragraphs.length <= 1) return;
      setParagraphs((prev) => {
        const next = prev.filter((_, i) => i !== index);
        history.push(next);
        return next;
      });
      setActiveIdx((prev) =>
        Math.max(0, Math.min(prev, paragraphs.length - 2)),
      );
      setDirty(true);
    },
    [paragraphs.length, history],
  );

  const addParagraphAfter = useCallback(
    (index) => {
      const base = paragraphs[index] || EMPTY_PARA;
      const newP = {
        ...EMPTY_PARA,
        font_size: base.font_size,
        font: base.font,
        line_height: base.line_height,
      };
      setParagraphs((prev) => {
        const next = [
          ...prev.slice(0, index + 1),
          newP,
          ...prev.slice(index + 1),
        ];
        history.push(next);
        return next;
      });
      setTimeout(() => setActiveIdx(index + 1), 0);
      setDirty(true);
    },
    [paragraphs, history],
  );

  const applyStyle = useCallback(
    (style) => {
      const { label, ...props } = style;
      updateActive(props);
    },
    [updateActive],
  );

  const handleFindReplace = useCallback(
    (find, replace) => {
      setParagraphs((prev) => {
        const next = prev.map((p) => ({
          ...p,
          text: (p.text || "").replaceAll(find, replace),
        }));
        history.push(next);
        return next;
      });
      setDirty(true);
    },
    [history],
  );

  const handleKeyDown = useCallback(
    (e, index) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        addParagraphAfter(index);
      }
      if (
        e.key === "Backspace" &&
        paragraphs[index]?.text === "" &&
        paragraphs.length > 1
      ) {
        e.preventDefault();
        deleteParagraph(index);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        updateActive({ bold: !active.bold });
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "i") {
        e.preventDefault();
        updateActive({ italic: !active.italic });
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "u") {
        e.preventDefault();
        updateActive({ underline: !active.underline });
      }
    },
    [addParagraphAfter, deleteParagraph, paragraphs, active, updateActive],
  );

  // ── Undo / Redo ─────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    const prev = history.undo();
    if (prev) {
      setParagraphs(prev);
      setDirty(true);
    }
  }, [history]);

  const handleRedo = useCallback(() => {
    const next = history.redo();
    if (next) {
      setParagraphs(next);
      setDirty(true);
    }
  }, [history]);

  // ── Save ────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!storageKey || !dirty) return;
    try {
      setSaving(true);
      setSaveError(null);
      const res = await fetch(`${API}editor/docx/${file.file_id}/save`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storage_key: storageKey, content: paragraphs }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setDirty(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  }, [storageKey, dirty, paragraphs, file.file_id]);

  // ── Keyboard shortcuts ──────────────────────────────────────────
  useEffect(() => {
    const fn = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Z") {
        e.preventDefault();
        handleRedo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setShowFind((s) => !s);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [handleSave, handleUndo, handleRedo]);

  const handleClose = () => {
    if (dirty && !window.confirm("Unsaved changes will be lost. Close anyway?"))
      return;
    onClose();
  };

  const currentHeadingStyle = useMemo(() => {
    if (active.bold && active.font_size >= 20) return HEADING_STYLES[1];
    if (active.bold && active.font_size >= 16) return HEADING_STYLES[2];
    if (active.bold && active.font_size >= 14) return HEADING_STYLES[3];
    return HEADING_STYLES[0];
  }, [active]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        background: "#f1f3f4",
        fontFamily: "'Google Sans', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* ── Menu bar ──────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "6px 12px 0",
          background: "#fff",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        {/* Doc icon + title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginRight: 8,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="4" fill="#4285f4" />
            <rect x="6" y="7" width="12" height="1.5" rx="0.75" fill="#fff" />
            <rect x="6" y="11" width="12" height="1.5" rx="0.75" fill="#fff" />
            <rect x="6" y="15" width="8" height="1.5" rx="0.75" fill="#fff" />
          </svg>
          <div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: "#202124",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {file.filename}
            </p>
            <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
              {[
                "File",
                "Edit",
                "View",
                "Insert",
                "Format",
                "Tools",
                "Help",
              ].map((item) => (
                <button
                  key={item}
                  style={{
                    fontSize: 12,
                    color: "#3c4043",
                    background: "none",
                    border: "none",
                    padding: "2px 6px",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e8eaed";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Save status + close */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {saveError && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                color: "#ea4335",
                fontSize: 12,
              }}
            >
              <AlertCircle size={13} /> {saveError}
            </span>
          )}
          {saving && (
            <span
              style={{
                fontSize: 12,
                color: "#80868b",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Loader
                size={12}
                style={{ animation: "spin 1s linear infinite" }}
              />{" "}
              Saving…
            </span>
          )}
          {saved && !saving && (
            <span
              style={{
                fontSize: 12,
                color: "#188038",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Check size={12} /> All changes saved
            </span>
          )}
          {dirty && !saving && !saved && (
            <span style={{ fontSize: 12, color: "#80868b" }}>
              Unsaved changes
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            style={{
              padding: "6px 16px",
              fontSize: 13,
              borderRadius: 4,
              fontWeight: 500,
              border: "none",
              cursor: dirty ? "pointer" : "not-allowed",
              background: dirty ? "#1a73e8" : "#e8eaed",
              color: dirty ? "#fff" : "#80868b",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "background 0.15s",
            }}
          >
            <Save size={13} />
            Save
          </button>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#5f6368",
              padding: 4,
              borderRadius: 4,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e8eaed";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "4px 12px",
          background: "#f8f9fa",
          borderBottom: "1px solid #e0e0e0",
          flexWrap: "wrap",
          minHeight: 42,
        }}
      >
        {/* Undo / Redo */}
        <ToolBtn
          onClick={handleUndo}
          disabled={!history.canUndo}
          title="Undo (⌘Z)"
        >
          <Undo size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={handleRedo}
          disabled={!history.canRedo}
          title="Redo (⌘⇧Z)"
        >
          <Redo size={14} />
        </ToolBtn>
        <Sep />

        {/* Heading style */}
        <Dropdown
          value={currentHeadingStyle.label}
          options={HEADING_STYLES.map((s) => s.label)}
          onChange={(v) => {
            const style = HEADING_STYLES.find((s) => s.label === v);
            if (style) applyStyle(style);
          }}
          width={130}
          renderOption={(opt) => {
            const style = HEADING_STYLES.find((s) => s.label === opt);
            return (
              <span
                style={{
                  fontSize: style ? Math.max(11, style.font_size * 0.7) : 13,
                  fontWeight: style?.bold ? "700" : "400",
                  fontStyle: style?.italic ? "italic" : "normal",
                }}
              >
                {opt}
              </span>
            );
          }}
        />
        <Sep />

        {/* Font family */}
        <Dropdown
          value={active.font || "Arial"}
          options={FONTS}
          onChange={(v) => updateActive({ font: v })}
          width={140}
          label="font"
        />

        {/* Font size */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <button
            onClick={() =>
              updateActive({
                font_size: Math.max(6, (active.font_size || 11) - 1),
              })
            }
            style={{
              width: 22,
              height: 28,
              border: "1px solid #dadce0",
              borderRight: "none",
              borderRadius: "4px 0 0 4px",
              background: "#fff",
              cursor: "pointer",
              color: "#3c4043",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f8f9fa";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
            }}
          >
            −
          </button>
          <input
            type="number"
            value={active.font_size || 11}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v > 0 && v <= 400)
                updateActive({ font_size: v });
            }}
            min={6}
            max={400}
            style={{
              width: 40,
              height: 28,
              border: "1px solid #dadce0",
              textAlign: "center",
              fontSize: 12,
              color: "#3c4043",
              background: "#fff",
              appearance: "textfield",
              MozAppearance: "textfield",
            }}
          />
          <button
            onClick={() =>
              updateActive({
                font_size: Math.min(400, (active.font_size || 11) + 1),
              })
            }
            style={{
              width: 22,
              height: 28,
              border: "1px solid #dadce0",
              borderLeft: "none",
              borderRadius: "0 4px 4px 0",
              background: "#fff",
              cursor: "pointer",
              color: "#3c4043",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f8f9fa";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
            }}
          >
            +
          </button>
        </div>
        <Sep />

        {/* Text formatting */}
        <ToolBtn
          active={active.bold}
          onClick={() => updateActive({ bold: !active.bold })}
          title="Bold (⌘B)"
        >
          <Bold size={14} />
        </ToolBtn>
        <ToolBtn
          active={active.italic}
          onClick={() => updateActive({ italic: !active.italic })}
          title="Italic (⌘I)"
        >
          <Italic size={14} />
        </ToolBtn>
        <ToolBtn
          active={active.underline}
          onClick={() => updateActive({ underline: !active.underline })}
          title="Underline (⌘U)"
        >
          <Underline size={14} />
        </ToolBtn>
        <ToolBtn
          active={active.strikethrough}
          onClick={() => updateActive({ strikethrough: !active.strikethrough })}
          title="Strikethrough"
        >
          <Strikethrough size={14} />
        </ToolBtn>

        {/* Color */}
        <ColorPicker
          value={active.color || "#000000"}
          onChange={(v) => updateActive({ color: v })}
          label="Text color"
        />
        <Sep />

        {/* Alignment */}
        <ToolBtn
          active={!active.align || active.align === "left"}
          onClick={() => updateActive({ align: "left" })}
          title="Left (⌘L)"
        >
          <AlignLeft size={14} />
        </ToolBtn>
        <ToolBtn
          active={active.align === "center"}
          onClick={() => updateActive({ align: "center" })}
          title="Center (⌘E)"
        >
          <AlignCenter size={14} />
        </ToolBtn>
        <ToolBtn
          active={active.align === "right"}
          onClick={() => updateActive({ align: "right" })}
          title="Right (⌘R)"
        >
          <AlignRight size={14} />
        </ToolBtn>
        <ToolBtn
          active={active.align === "justify"}
          onClick={() => updateActive({ align: "justify" })}
          title="Justify"
        >
          <AlignJustify size={14} />
        </ToolBtn>
        <Sep />

        {/* Indent */}
        <ToolBtn
          onClick={() =>
            updateActive({ indent: Math.max(0, (active.indent || 0) - 1) })
          }
          title="Decrease indent"
        >
          <Outdent size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() =>
            updateActive({ indent: Math.min(10, (active.indent || 0) + 1) })
          }
          title="Increase indent"
        >
          <Indent size={14} />
        </ToolBtn>
        <Sep />

        {/* Line height */}
        <Dropdown
          value={active.line_height || 1.5}
          options={LINE_HEIGHTS}
          onChange={(v) => updateActive({ line_height: Number(v) })}
          width={90}
          renderValue={(v) => `≡ ${v}`}
          renderOption={(opt) => opt.label}
        />
        <Sep />

        {/* Add paragraph + Find */}
        <ToolBtn
          onClick={() => addParagraphAfter(activeIdx)}
          title="Add paragraph (Enter)"
        >
          <Plus size={14} />
        </ToolBtn>
        <ToolBtn
          active={showFind}
          onClick={() => setShowFind((s) => !s)}
          title="Find & replace (⌘F)"
        >
          <Search size={14} />
        </ToolBtn>

        {/* Zoom — pushed right */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <ToolBtn
            onClick={() => {
              const i = ZOOM_LEVELS.indexOf(zoom);
              setZoom(ZOOM_LEVELS[Math.max(i - 1, 0)]);
            }}
            title="Zoom out"
          >
            <ZoomOut size={13} />
          </ToolBtn>
          <ZoomControl zoom={zoom} onChange={setZoom} />
          <ToolBtn
            onClick={() => {
              const i = ZOOM_LEVELS.indexOf(zoom);
              setZoom(ZOOM_LEVELS[Math.min(i + 1, ZOOM_LEVELS.length - 1)]);
            }}
            title="Zoom in"
          >
            <ZoomIn size={13} />
          </ToolBtn>
        </div>
      </div>

      {/* ── Document canvas ────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          padding: "32px 24px",
          background: "#f1f3f4",
          position: "relative",
        }}
      >
        {/* Find & Replace */}
        {showFind && (
          <div style={{ position: "fixed", top: 120, right: 24, zIndex: 200 }}>
            <FindReplace
              paragraphs={paragraphs}
              onReplace={handleFindReplace}
              onClose={() => setShowFind(false)}
            />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              color: "#80868b",
              alignSelf: "center",
            }}
          >
            <Loader
              size={24}
              style={{ animation: "spin 1s linear infinite", color: "#1a73e8" }}
            />
            <span style={{ fontSize: 14 }}>Loading document…</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              alignSelf: "center",
            }}
          >
            <AlertCircle size={24} style={{ color: "#ea4335" }} />
            <p style={{ color: "#ea4335", fontSize: 14 }}>{error}</p>
          </div>
        )}

        {/* ── Multi-page canvas ──────────────────────────────────── */}
        {!loading && !error && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              alignItems: "center",
              width: "100%",
            }}
          >
            {pages.map((paraIndices, pageIdx) => (
              <Page
                key={pageIdx}
                pageNumber={pageIdx + 1}
                totalPages={pages.length}
                paraIndices={paraIndices}
                paragraphs={paragraphs}
                activeIdx={activeIdx}
                setActiveIdx={setActiveIdx}
                updateParagraph={updateParagraph}
                deleteParagraph={deleteParagraph}
                handleKeyDown={handleKeyDown}
                zoom={zoom}
                pageW={pageW}
                padV={padV}
                padH={padH}
                pageContentH={pageContentH}
                onParaHeightChange={handleParaHeightChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Status bar ────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 16px",
          background: "#1a73e8",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 20,
            fontSize: 11,
            color: "rgba(255,255,255,0.75)",
            fontFamily: "monospace",
          }}
        >
          <span>
            {pages.length} page{pages.length !== 1 ? "s" : ""}
          </span>
          <span>
            {paragraphs.length} paragraph{paragraphs.length !== 1 ? "s" : ""}
          </span>
          <span>
            {stats.words} word{stats.words !== 1 ? "s" : ""}
          </span>
          <span>{stats.chars} chars</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {dirty && (
            <span
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.6)",
                fontFamily: "monospace",
              }}
            >
              ⌘S to save
            </span>
          )}
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.55)",
              fontFamily: "monospace",
            }}
          >
            Page {activePage} · Para {activeIdx + 1} of {paragraphs.length}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .para-delete-btn { opacity: 0 !important; }
        div:hover > .para-delete-btn { opacity: 0.7 !important; }
        .para-delete-btn:hover { opacity: 1 !important; background: #fce8e6 !important; }
        textarea::placeholder { color: #bdc1c6; }
        textarea:focus { background: rgba(26,115,232,0.02) !important; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};

export default DocxEditor;
