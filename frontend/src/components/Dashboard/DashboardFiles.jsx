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

// DashboardFiles.jsx
// Parent is clean — no URL fetching logic here.
// Each FileCard handles its own lazy fetch via useInViewUrl.

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserFiles, deleteAllFiles } from "../../store/slices/FileSlices";
import FileCard from "./FileCard";
import NofileFound from "./NofileFound";
import { Grid, List } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { clearUrlCache, removeCachedUrl } from "../../helpers/urlCache";
import FileCardSkeleton from "./FileCardSkeleton";
import SortDropdown from "./SortDropdown";

import { API } from "../../api/api";

const DashboardFiles = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const dispatch = useDispatch();
  const { userFiles = [], loadingFiles } = useSelector((state) => state.files);

  const [view, setView] = useState("list");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400); // 400ms sweet spot

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    dispatch(fetchUserFiles());
  }, [dispatch]);

  const handleDownload = React.useCallback((file) => {
    const url = file?.download_url;

    console.log("FILE URL:", url);
    if (url) {
      window.open(url, "_blank");
    } else {
      window.open(`${API}/files/download/${file.file_id}`, "_blank");
    }
  }, []);

  const handleDelete = React.useCallback((fileId) => {
    removeCachedUrl(fileId);
    // dispatch your single delete action here
  }, []);

  const handleDeleteAll = React.useCallback(async () => {
    try {
      setDeletingAll(true);
      await dispatch(deleteAllFiles()).unwrap();
      clearUrlCache();
      toast.success("All files deleted");
      setDeleteModalOpen(false);
    } catch {
      toast.error("Failed to delete all");
    } finally {
      setDeletingAll(false);
    }
  }, [dispatch]);

  const processedFiles = React.useMemo(() => {
    let files = [...userFiles];

    // 🔍 SEARCH FILTER
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      files = files.filter((f) => f.filename?.toLowerCase().includes(q));
    }

    // 🔃 SORTING
    switch (sortBy) {
      case "default":
        return files;

      case "name_asc":
        return files.sort((a, b) => a.filename.localeCompare(b.filename));

      case "name_desc":
        return files.sort((a, b) => b.filename.localeCompare(a.filename));

      case "size_asc":
        return files.sort((a, b) => a.size - b.size);

      case "size_desc":
        return files.sort((a, b) => b.size - a.size);

      case "date_asc":
        return files.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at),
        );

      case "date_desc":
      default:
        return files.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
    }
  }, [userFiles, sortBy, debouncedSearch]);

  return (
    <div className="ml-0 md:ml-[260px] flex-1 p-3 pt-20 md:pt-3">
      <div className="min-w-full min-h-full bg-[#0d0d0d] rounded-xl border border-[#ffffff10] p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-white text-lg font-medium">Your Files</h1>
          <div className="flex items-center gap-3">
            {!loadingFiles && userFiles.length > 0 && (
              <div className="flex items-center gap-3">
                {/* SEARCH */}
                <div className="flex items-center px-3 py-1.5 bg-[#161616] border border-[#ffffff08] rounded-md focus-within:border-[#ffffff30] transition-all duration-200 ease-in-out ">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search files..."
                    className="bg-transparent outline-none text-[11px] text-white placeholder:text-[#444] w-36  "
                  />

                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="text-[10px] text-[#555] hover:text-white ml-2"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* SORT */}
                <SortDropdown value={sortBy} onChange={setSortBy} />
              </div>
            )}
            {userFiles.length > 0 && (
              <div className="flex bg-[#1a1a1a] border border-[#ffffff10] rounded-lg overflow-hidden">
                <button
                  onClick={() => setView("list")}
                  className={`p-2 transition ${view === "list" ? "bg-white text-black" : "text-[#8a8a8a] hover:text-white"}`}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 transition ${view === "grid" ? "bg-white text-black" : "text-[#8a8a8a] hover:text-white"}`}
                >
                  <Grid size={16} />
                </button>
              </div>
            )}

            {userFiles.length > 0 && (
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="text-xs text-red-400 hover:text-red-300 transition"
              >
                Delete All
              </button>
            )}
          </div>
        </div>

        {loadingFiles && (
          <div
            className={
              view === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 gap-4"
                : "flex flex-col"
            }
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <FileCardSkeleton key={i} view={view} />
            ))}
          </div>
        )}
        {!loadingFiles && userFiles.length === 0 && <NofileFound />}

        {!loadingFiles && userFiles.length > 0 && (
          <div
            className={
              view === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 gap-4"
                : "flex flex-col gap-3"
            }
          >
            {processedFiles.map((file) => (
              <FileCard
                key={file.file_id}
                file={file}
                onDownload={handleDownload}
                onDelete={handleDelete}
                view={view}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAll}
        loading={deletingAll}
      />
    </div>
  );
};

export default DashboardFiles;
