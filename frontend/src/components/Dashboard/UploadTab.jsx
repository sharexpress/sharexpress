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

import React from "react";

const UploadTab = ({
  dragActive,
  setDragActive,
  handleChange,
  files,
  progressMap,
}) => {
  return (
    <div className="space-y-5">
      {/* DROP ZONE */}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleChange({ target: { files: e.dataTransfer.files } });
        }}
        className={`p-10 border rounded-xl text-center cursor-pointer transition ${
          dragActive
            ? "border-white bg-white/5 scale-[1.01]"
            : "border-[#ffffff20]"
        }`}
      >
        <p className="text-xs text-gray-400">
          Drag & drop files or click to upload
        </p>
        <input type="file" multiple hidden onChange={handleChange} />
      </label>

      {/* FILE LIST */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((file, i) => (
            <div
              key={i}
              className="bg-[#1a1a1a] p-3 rounded-lg border border-[#ffffff08]"
            >
              <div className="flex justify-between">
                <p className="text-xs text-white truncate w-[70%]">
                  {file.name}
                </p>
                <span className="text-[10px] text-gray-400">
                  {progressMap[i] || 0}%
                </span>
              </div>

              <div className="h-[4px] bg-[#2a2a2a] mt-2 rounded">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${progressMap[i] || 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadTab;
