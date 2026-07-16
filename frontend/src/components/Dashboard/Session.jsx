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

import React, { useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { Merge, QrCode } from "lucide-react";
import WButton from "../../components/WButton";
import QRScanner from "../QRScanner";
import { toast } from "react-toastify";
import QrScanner from "qr-scanner";
import { useSelector, useDispatch } from "react-redux";
import { ResolveQR } from "../../store/slices/QrSlice";
import QRuserInfoCard from "./QRuserInfoCard";
import { clearReceiver } from "../../store/slices/QrSlice";
import { SearchEmail } from "../../store/slices/QrSlice";
import { validateEmail } from "../../helpers/validateEmail";
import ActiveSession from "./ActiveSession";
import { check_session } from "../../store/slices/ShareSessionSlice";

const Session = () => {
  const fileInputRef = useRef();
  const { loading, success, error, check_loading, check_success, check_error } =
    useSelector((state) => state.session);

  const [email, setEmail] = useState("");
  const [QR_SCAN_OPEN, setQR_SCAN_OPEN] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const check = async () => {
      try {
        await dispatch(check_session()).unwrap();
      } catch (err) {
        console.log("Session check failed:", err);
      }
    };

    check();
  }, [dispatch]);

  const handleSearch = async () => {
    const normalized = email.trim().toLowerCase();

    if (!normalized) {
      toast.warning("Please enter an email");
      return;
    }

    if (!validateEmail(normalized)) {
      toast.error("Invalid email format");
      return;
    }

    try {
      dispatch(clearReceiver());

      await dispatch(SearchEmail(normalized)).unwrap();
    } catch (err) {
      console.log(err);
    }
  };

  const handleQRScan = async (data) => {
    dispatch(clearReceiver());

    const res = await dispatch(ResolveQR(data));

    setQR_SCAN_OPEN(false);
  };

  const handleQRUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Scanning QR...");

    try {
      // ✅ direct scan (no image conversion needed)
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
      });

      const token = result?.data;
      if (!token) throw new Error();

      dispatch(clearReceiver());
      await dispatch(ResolveQR(token)).unwrap();

      toast.update(toastId, {
        render: "QR scanned successfully",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (err) {
      console.log(err);

      toast.update(toastId, {
        render: "Invalid QR",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }

    e.target.value = "";
  };
  return (
    <>
      <div className="ml-0 md:ml-[260px] flex-1 p-3 pt-20 md:pt-3">
        <div className="w-full h-full bg-[#0d0d0d] rounded-xl border border-[#ffffff10] p-6">
          <h1 className="text-white text-lg font-medium mb-8">Sessions</h1>

          <div className="max-w-[700px] mx-auto flex flex-col gap-8">
            {/* EMAIL SEARCH */}
            <div className="bg-[#171717] border border-[#ffffff10] rounded-xl p-6 transition-all duration-300 ease-in-out ">
              <h2 className="text-white text-sm mb-4">Connect by Email</h2>

              <div className="flex gap-3">
                <div className="flex items-center bg-[#1f1f1f] border border-[#ffffff10] rounded-4xl px-3 flex-1 transition-all duration-200 focus-within:border-[#ffffff30]">
                  <FiSearch className="text-[#7a7a7a]" />

                  <input
                    type="email"
                    placeholder="Enter user email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent text-white text-sm px-3 py-2 outline-none w-full"
                  />
                </div>

                <div onClick={handleSearch}>
                  <WButton text={"Search"} Font_extralight />
                </div>
              </div>
            </div>
            {/* QR SECTION */}
            <div className="bg-[#171717] border border-[#ffffff10] rounded-xl p-6 flex flex-col items-center gap-4 transition-all duration-200  ">
              <QrCode size={42} className="text-white" />

              <h2 className="text-white text-sm">Scan QR to Join Session</h2>

              <p className="text-[#7a7a7a] text-xs text-center max-w-[320px]">
                Scan or upload a QR code from another device to instantly
                connect and share files.
              </p>

              {/* BUTTONS */}
              <div className="flex gap-3">
                <div onClick={() => setQR_SCAN_OPEN((prev) => !prev)}>
                  <WButton
                    text={QR_SCAN_OPEN ? "Close Scanner" : "Scan QR"}
                    Font_extralight
                  />
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleQRUpload}
                  className="hidden"
                />

                <div onClick={() => fileInputRef.current?.click()}>
                  <WButton text={"Upload QR"} Font_extralight />
                </div>
              </div>

              {/* CAMERA */}
              {QR_SCAN_OPEN && (
                <div className="mt-4">
                  <QRScanner onScan={handleQRScan} />
                </div>
              )}
            </div>
            {(success || check_success || check_loading || loading) && (
              <ActiveSession />
            )}{" "}
          </div>
        </div>
      </div>

      <QRuserInfoCard />
    </>
  );
};

export default Session;
