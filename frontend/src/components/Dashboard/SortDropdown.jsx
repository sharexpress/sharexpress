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

import React, { useState, useEffect, useRef } from "react";

const SORT_GROUPS = [
  {
    label: "Date",
    items: [
      { label: "Newest", value: "date_desc" },
      { label: "Oldest", value: "date_asc" },
    ],
  },
  {
    label: "Name",
    items: [
      { label: "A → Z", value: "name_asc" },
      { label: "Z → A", value: "name_desc" },
    ],
  },
  {
    label: "Size",
    items: [
      { label: "Largest", value: "size_desc" },
      { label: "Smallest", value: "size_asc" },
    ],
  },
];

const SortDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // 👉 find active label
  const active =
    SORT_GROUPS.flatMap((g) => g.items).find((o) => o.value === value) ||
    SORT_GROUPS[0].items[0];

  // 👉 close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (!ref.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="flex items-center gap-2 px-3 py-1.5 text-[11px] tracking-wide text-[#aaa] bg-[#161616] border border-[#ffffff08] rounded-md"
      >
        <span className="text-[#555]">SORT</span>
        <span className="text-white">{active.label}</span>
        <span className="text-[#444] text-[10px]">▾</span>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-[#0f0f0f] border border-[#ffffff08] rounded-lg overflow-hidden z-50 shadow-lg">
          {SORT_GROUPS.map((group) => (
            <div key={group.label} className="py-1">
              {/* GROUP LABEL */}
              <div className="px-3 py-1 text-[9px] text-[#444] uppercase tracking-wider">
                {group.label}
              </div>

              {/* OPTIONS */}
              {group.items.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-xs ${
                    value === opt.value
                      ? "text-white bg-[#1a1a1a]"
                      : "text-[#888] hover:text-white hover:bg-[#141414]"
                  }`}
                >
                  {opt.label}

                  {/* ACTIVE CHECK */}
                  {value === opt.value && (
                    <span className="ml-auto text-[10px] text-[#666]">✓</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(SortDropdown);
