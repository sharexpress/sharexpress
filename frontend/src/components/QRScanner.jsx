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

import React, { useEffect, useRef } from "react";
import QrScanner from "qr-scanner";
import { toast } from "react-toastify";

const QRScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    scannerRef.current = new QrScanner(
      videoRef.current,
      (result) => {
        console.log("QR Result:", result.data);

        if (onScan) {
          onScan(result.data);
        }
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
        returnDetailedScanResult: true,
      },
    );

    scannerRef.current.start().catch(() => {
      toast.error("Camera access denied");
    });

    return () => {
      scannerRef.current?.stop();
      scannerRef.current?.destroy();
    };
  }, [onScan]);

  // Upload QR image
  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
      });

      console.log("QR from image:", result.data);

      if (onScan) {
        onScan(result.data);
      }
    } catch {
      toast.error("Invalid QR image");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <video
        ref={videoRef}
        className="w-[320px] rounded-lg border border-[#ffffff20]"
      />

      <label className="text-xs text-[#8a8a8a] cursor-pointer hover:text-white transition">
        Upload QR image
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default QRScanner;
