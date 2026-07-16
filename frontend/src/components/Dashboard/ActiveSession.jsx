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

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link2, ShieldCheck, AlertCircle, Power } from "lucide-react";
import { toast } from "react-toastify";
import {
  clearSessionState,
  revokeSession,
} from "../../store/slices/ShareSessionSlice";
import { fetchSessionFiles } from "../../store/slices/FileSlices";
import WButton from "../../components/WButton";
import { disconnectSocket } from "../../helpers/socket";
import UploadModal from "./UploadModal";
import { API } from "../../api/api";

const formatSize = (size) => {
  if (!size) return "0 B";
  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
  return (size / (1024 * 1024)).toFixed(1) + " MB";
};

const ActiveSession = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (!openModal) return;

    const stateId = { modal: "upload-" + Date.now() };
    window.history.pushState(stateId, "");

    const handlePopState = () => {
      setOpenModal(false);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (window.history.state?.modal?.startsWith("upload-")) {
        window.history.back();
      }
    };
  }, [openModal]);

  const {
    sender_name,
    reciever_name,
    loading,
    error,
    check_sender_name,
    check_receiver_name,
    check_loading,
    sender_ID,
  } = useSelector((state) => state.session);

  const { sessionFiles = [], loadingSessionFiles } = useSelector((state) => state.files);
  const { session_id } = useSelector((state) => state.session);

  const isActive =
    check_sender_name || check_receiver_name || sender_name || reciever_name;

  const isSender = user?.user_id === sender_ID;

  useEffect(() => {
    if (!isSender && session_id) {
      dispatch(fetchSessionFiles(session_id));
    }
  }, [dispatch, isSender, session_id]);

  if (!isActive) return null;

  const sender = check_sender_name || sender_name;
  const receiver = check_receiver_name || reciever_name;

  // 🔥 MODAL RENDER
  if (openModal) {
    return <UploadModal onClose={() => setOpenModal(false)} />;
  }

  if (loading || check_loading) {
    return (
      <div className="w-full bg-[#171717] border border-[#ffffff15] rounded-2xl p-5 animate-pulse">
        <div className="h-3 w-24 bg-[#2a2a2a] rounded mb-3"></div>
        <div className="h-10 w-full bg-[#2a2a2a] rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#171717] border border-[#ffffff15] rounded-2xl p-5">
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle size={16} />
          Session Error
        </div>
      </div>
    );
  }

  const handleTerminate = async () => {
    try {
      await dispatch(revokeSession()).unwrap();
      dispatch(clearSessionState());
      toast.info("Session terminated");
    } catch {
      toast.error("Failed to terminate session");
    }
  };

  return (
    <div className="w-full bg-[#171717] border border-[#ffffff15] rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
      {/* HEADER */}
      <div className="flex items-center gap-2 text-white text-sm font-medium tracking-wide">
        <Link2 size={16} className="text-green-400" />
        Active Session
      </div>

      {/* CARD */}
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-full bg-[#202020] flex items-center justify-center text-green-400">
          <ShieldCheck size={18} />
        </div>

        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col leading-tight">
            <p className="text-white text-sm">
              {sender} ↔ {receiver}
            </p>

            <p
              className={`text-xs mt-1 ${
                isSender ? "text-green-400" : "text-blue-400"
              }`}
            >
              {isSender ? "You are sending files" : "You are receiving files"}
            </p>
          </div>

          {/* 🔥 SEND FILES BUTTON */}
          {isSender && (
            <button onClick={() => setOpenModal(true)}>
              <WButton Font_extralight={true} text={"Send Files"} />
            </button>
          )}
        </div>
      </div>

      {/* STATUS */}
      <div className="flex items-center justify-between text-xs text-[#8a8a8a]">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          Session Active
        </span>
      </div>

      {/* FILES LIST FOR RECEIVER */}
      {!isSender && (
        <div className="mt-2 border-t border-[#ffffff10] pt-4 flex flex-col gap-3">
          <p className="text-white text-xs font-medium uppercase tracking-wider text-[#8a8a8a]">
            Shared Files ({sessionFiles.length})
          </p>
          
          {loadingSessionFiles ? (
            <div className="text-xs text-[#555] animate-pulse">Loading shared files...</div>
          ) : sessionFiles.length === 0 ? (
            <div className="text-xs text-[#555]">No files shared in this session yet.</div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
              {sessionFiles.map((file) => (
                <div key={file.file_id} className="flex justify-between items-center bg-[#1f1f1f] px-3 py-2 rounded-lg border border-[#ffffff05]">
                  <div className="flex flex-col min-w-0">
                    <span className="text-white text-xs truncate max-w-[150px]">{file.filename}</span>
                    <span className="text-[10px] text-[#7a7a7a] font-mono">{formatSize(file.size)}</span>
                  </div>
                  <button 
                    onClick={() => window.open(`${API}/files/download/${file.file_id}`, "_blank")}
                    className="text-xs text-[#a3a3a3] hover:text-white px-2 py-1 bg-white/5 hover:bg-white/10 rounded transition shrink-0"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TERMINATE */}
      <button
        onClick={async () => {
          try {
            if (isSender) {
              await handleTerminate();
              disconnectSocket();
            } else {
              dispatch(clearSessionState());
              disconnectSocket();
              toast.info("Disconnected from session");
            }
          } catch (err) {
            console.error("Terminate error:", err);
            toast.error("Failed to terminate");
          }
        }}
        className="flex items-center justify-center gap-2 mt-2 text-xs text-red-400 border border-red-400/20 rounded-lg py-2 hover:bg-red-400/10 transition"
      >
        <Power size={14} />
        {isSender ? "Terminate Session" : "Disconnect"}
      </button>
    </div>
  );
};

export default ActiveSession;
