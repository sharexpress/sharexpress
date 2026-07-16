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

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiUser, FiMail, FiX, FiAlertCircle } from "react-icons/fi";
import WButton from "../../components/WButton";
import { clearReceiver } from "../../store/slices/QrSlice";
import { SessionCreate } from "../../store/slices/ShareSessionSlice";
import { toast } from "react-toastify";
import ActiveSession from "./ActiveSession";

const QRuserInfoCard = () => {
  const dispatch = useDispatch();

  const {
    reciever_name,
    reciever_email,
    reciever_img,
    reciever_loading,
    reciever_error,
    receiver_QR,
  } = useSelector((state) => state.QR);

  const { loading, success, error } = useSelector((state) => state.session);
  const [close_Card, setclose_Card] = useState(false);

  // useEffect(() => {
  //   if (success) {
  //     const timer = setTimeout(() => {
  //       setclose_Card(true);
  //       dispatch(clearReceiver());
  //     }, 1000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [success, dispatch]);

  useEffect(() => {
    if (success) {
      toast.success("Session Connected");
    }

    if (error) {
      toast.error("Failed to Connect");
    }
  }, [success, error]);

  const {
    sharing_token,

    sender_name,
    reciever_name: sessionReceiver,
  } = useSelector((state) => state.session);

  if (!reciever_loading && !reciever_error && !reciever_name) return null;

  const initial = reciever_name?.charAt(0)?.toUpperCase() || "U";

  const handleSessionCreate = async () => {
    const res = await dispatch(SessionCreate(receiver_QR));
    console.log(res.payload);
  };

  let button_text = "Connect Session";

  if (loading) button_text = "LOADING...";
  else if (success) button_text = "CONNECTED";
  else if (error) button_text = "FAILED TO CONNECT";

  console.log(button_text);

  if (close_Card) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[100] animate-slideIn">
        <div className="w-[320px] bg-[#171717] border border-[#ffffff15] rounded-2xl p-5 flex flex-col gap-4 shadow-2xl relative">
          {/* CLOSE BUTTON */}
          <button
            onClick={() => dispatch(clearReceiver())}
            className="absolute top-3 right-3 text-[#8a8a8a] hover:text-white transition"
          >
            <FiX size={16} />
          </button>

          {/* LOADING STATE */}
          {reciever_loading && (
            <>
              <h2 className="text-white text-sm font-medium tracking-wide">
                Searching User...
              </h2>

              <div className="flex items-center gap-4 animate-pulse">
                <div className="h-11 w-11 rounded-full bg-[#2a2a2a]" />

                <div className="flex flex-col gap-2">
                  <div className="h-3 w-24 bg-[#2a2a2a] rounded" />
                  <div className="h-3 w-32 bg-[#2a2a2a] rounded" />
                </div>
              </div>
            </>
          )}

          {/* ERROR STATE */}
          {reciever_error && !reciever_loading && (
            <>
              <h2 className="text-white text-sm font-medium tracking-wide">
                Error
              </h2>

              <div className="flex items-center gap-3 text-red-400 text-sm">
                <FiAlertCircle />
                {reciever_error?.detail || reciever_error}
              </div>

              <button
                onClick={() => dispatch(clearReceiver())}
                className="flex justify-end"
              >
                <WButton text={"Dismiss"} Font_extralight />
              </button>
            </>
          )}

          {/* SUCCESS STATE */}
          {reciever_name && !reciever_loading && !reciever_error && (
            <>
              <h2 className="text-white text-sm font-medium tracking-wide">
                QR Owner Found
              </h2>

              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-full overflow-hidden bg-[#202020] flex items-center justify-center text-white font-medium text-sm">
                  {reciever_img ? (
                    <img
                      src={reciever_img}
                      alt="profile"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    initial
                  )}
                </div>

                <div className="flex flex-col leading-tight">
                  <div className="flex items-center gap-2 text-white text-sm">
                    <FiUser size={14} className="text-[#8a8a8a]" />
                    {reciever_name}
                  </div>

                  <div className="flex items-center gap-2 text-[#8a8a8a] text-xs mt-1">
                    <FiMail size={14} />
                    {reciever_email}
                  </div>
                </div>
              </div>
              <button
                onClick={handleSessionCreate}
                disabled={loading || success || (success && loading)}
              >
                <div className="flex justify-end bg ">
                  <WButton
                    text={button_text}
                    Font_extralight
                    bg_green={success}
                    disabled={loading || success || (loading && success)}
                  />
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default QRuserInfoCard;
