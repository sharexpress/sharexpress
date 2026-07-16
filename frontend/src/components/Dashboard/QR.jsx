// Copyright 2026 Sharexpress
//
// Licensed under the Apache License, Version 2.0

import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { GenerateQRCode } from "../../store/slices/QrSlice";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "react-toastify";

const QR = () => {
  const { QRToken, loading } = useSelector((state) => state.QR);
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const initial = user?.user_name?.charAt(0)?.toUpperCase() || "U";

  const hasGenerated = useRef(false);

  useEffect(() => {
    if (hasGenerated.current) return;

    hasGenerated.current = true;

    dispatch(GenerateQRCode())
      .unwrap()
      .catch(() => {
        toast.error("Failed to generate QR");
      });
  }, [dispatch]);

  const HandleRegenQR = async () => {
    try {
      await dispatch(GenerateQRCode()).unwrap();
      toast.success("QR Generated");
    } catch {
      toast.error("Failed to regenerate QR");
    }
  };

  return (
    <div className="ml-0 md:ml-[260px] flex-1 p-3 pt-20 md:pt-3">
      <div className="w-full h-full bg-[#0d0d0d] rounded-xl border border-[#ffffff10] p-6">
        <h1 className="text-white text-lg font-medium mb-10">QR Code</h1>

        <div className="w-full flex justify-center">
          <div className="w-[600px] flex flex-col gap-4">
            <h2 className="text-white text-sm">Share Access</h2>

            <div className="bg-[#171717] border border-[#ffffff10] rounded-2xl p-8 flex flex-col items-center gap-6">
              {/* USER PROFILE */}
              <div className="flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-[#202020] flex items-center justify-center text-white text-lg font-medium">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt="profile"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    initial
                  )}
                </div>

                <h3 className="text-white text-sm font-light">
                  {user?.user_name || "User"}
                </h3>
              </div>

              {/* QR CODE */}
              <div className="w-[220px] h-[220px] bg-white rounded-xl flex items-center justify-center relative overflow-hidden">
                {loading ? (
                  <div className="w-[200px] h-[200px] grid grid-cols-6 gap-[3px] animate-pulse">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className="bg-black/10 rounded-[2px]" />
                    ))}
                  </div>
                ) : QRToken ? (
                  <QRCodeCanvas value={QRToken} size={200} />
                ) : (
                  <p className="text-black text-sm">No QR available</p>
                )}
              </div>

              <p className="text-xs text-[#7a7a7a] text-center max-w-[300px]">
                Scan this QR code from another device to quickly access your
                Sharexpress session.
              </p>

              <button
                onClick={HandleRegenQR}
                disabled={loading}
                className="bg-white text-black text-sm px-5 py-2 cursor-pointer rounded-full hover:bg-[#cfcfcf] transition disabled:opacity-50"
              >
                {loading ? "Generating..." : "Regenerate QR"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QR;
