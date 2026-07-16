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
import useInViewUrl, { getFileType } from "../../helpers/Useinviewurl";
import PreviewThumbnail from "./Previewthumbnail";

const FilePreviewCard = ({ file, selected, onClick }) => {
  const { ref, url, loading, error, retry } = useInViewUrl(file);
  const type = getFileType(file?.filename);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`group p-2 border rounded-lg cursor-pointer transition ${
        selected
          ? "border-white bg-[#1a1a1a]"
          : "border-[#ffffff10] hover:border-white/30"
      }`}
    >
      {/* THUMBNAIL */}
      <div className="h-[90px] bg-[#111] rounded flex items-center justify-center overflow-hidden">
        <PreviewThumbnail
          type={type}
          url={url}
          filename={file.filename}
          size="full"
          loading={loading}
          error={error}
          onRetry={retry}
        />
      </div>

      {/* NAME */}
      <p className="text-white text-[11px] mt-2 truncate">{file.filename}</p>
    </div>
  );
};

export default FilePreviewCard;
