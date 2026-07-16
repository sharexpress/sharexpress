// Copyright 2026 Sharexpress
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
//
import React, { useState } from "react";
import LOGOw from "../assets/logo.png";
import { useSelector } from "react-redux";
import { IoMdMore } from "react-icons/io";
import SettingsProfile from "../components/SettingsProfile";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useRef, useEffect } from "react";
import DashboardFiles from "../components/Dashboard/DashboardFiles";
import History from "../components/Dashboard/History";
import Profile from "../components/Dashboard/Profile";
import QR from "../components/Dashboard/QR";
import Session from "../components/Dashboard/Session";


const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  const [isOpenProfile, setIsOpenProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initial = user?.user_name?.charAt(0)?.toUpperCase() || "U";

  const handleProfileOpening = () => {
    setIsOpenProfile((prev) => !prev);
  };

  useEffect(() => {
    queueMicrotask(() => {
      setIsOpenProfile(false);
    });

    switch (location.pathname) {
      case "/dashboard":
        document.title = "Your Files — ShareXpress Dashboard";
        break;
      case "/dashboard/history":
        document.title = "History — ShareXpress Dashboard";
        break;
      case "/dashboard/QR":
        document.title = "QR Code — ShareXpress Dashboard";
        break;
      case "/dashboard/session":
        document.title = "Active Session — ShareXpress Dashboard";
        break;
      case "/dashboard/profile":
        document.title = "Account Settings — ShareXpress Dashboard";
        break;
      default:
        document.title = "Dashboard — ShareXpress";
        break;
    }
  }, [location.pathname]);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpenProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMenuClick = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="w-full h-screen bg-black flex flex-col md:flex-row overflow-hidden">
      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black border-b border-[#ffffff10] flex items-center justify-between px-5 z-40">
        <img
          src={LOGOw}
          alt="sharexpress logo"
          className="h-8 object-contain"
        />
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-white hover:text-gray-300 p-2"
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 z-45 transition-opacity"
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`w-[260px] h-screen fixed left-0 top-0 px-5 py-5 flex flex-col bg-black border-r border-[#ffffff10] md:border-r-0 z-50 transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* LOGO & CLOSE BUTTON */}
        <div className="flex items-center justify-between gap-2 mb-8">
          <img
            src={LOGOw}
            alt="sharexpress logo"
            className="h-10 object-contain"
          />
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-[#9a9a9a] hover:text-white p-1"
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* MENU */}
        <div>
          <h1 className="text-[11px] tracking-wide text-[#6b6b6b] uppercase mb-3">
            Uploads
          </h1>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => handleMenuClick("/dashboard")}
              className={`text-left rounded-md px-4 py-2 text-sm transition
                  ${
                    isActive("/dashboard")
                      ? "bg-[#1a1a1a] text-white"
                      : "text-[#b3b3b3] hover:bg-[#1a1a1a] hover:text-white"
                  }`}
            >
              Files
            </button>

            <button
              onClick={() => handleMenuClick("/dashboard/history")}
              className={`text-left rounded-md px-4 py-2 text-sm transition
                  ${
                    isActive("/dashboard/history")
                      ? "bg-[#1a1a1a] text-white"
                      : "text-[#b3b3b3] hover:bg-[#1a1a1a] hover:text-white"
                  }`}
            >
              History
            </button>
            <button
              onClick={() => handleMenuClick("/dashboard/QR")}
              className={`text-left rounded-md px-4 py-2 text-sm transition
                  ${
                    isActive("/dashboard/QR")
                      ? "bg-[#1a1a1a] text-white"
                      : "text-[#b3b3b3] hover:bg-[#1a1a1a] hover:text-white"
                  }`}
            >
              QR Code
            </button>
            <button
              onClick={() => handleMenuClick("/dashboard/session")}
              className={`text-left rounded-md px-4 py-2 text-sm transition
                  ${
                    isActive("/dashboard/session")
                      ? "bg-[#1a1a1a] text-white"
                      : "text-[#b3b3b3] hover:bg-[#1a1a1a] hover:text-white"
                  }`}
            >
              Session
            </button>
          </div>
        </div>

        {/* PROFILE */}
        <div
          ref={dropdownRef}
          className="mt-auto border-t border-[#ffffff10] pt-4 relative"
        >
          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#1a1a1a] transition">
            {/* AVATAR */}
            <div className="h-9 w-9 flex-shrink-0 rounded-full overflow-hidden bg-[#202020] flex items-center justify-center text-white text-sm font-medium">
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

            {/* USER INFO */}
            <div className="flex-1 leading-tight">
              <div className="flex justify-between items-center">
                <p className="text-sm text-white font-medium">
                  {user?.user_name || "User"}
                </p>

                <IoMdMore
                  ref={triggerRef}
                  onClick={handleProfileOpening}
                  className="text-[#9a9a9a] hover:text-white cursor-pointer"
                />
              </div>

              <p className="text-xs text-[#7a7a7a] truncate max-w-[150px]">
                {user?.email || ""}
              </p>
            </div>
          </div>

          {/* PROFILE DROPDOWN */}
          {isOpenProfile && (
            <div ref={dropdownRef} className="absolute bottom-0 left-55 z-1000">
              <SettingsProfile />
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT   */}
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route index element={<DashboardFiles />} />
          <Route path="history" element={<History />} />
          <Route path="profile" element={<Profile />} />
          <Route path="QR" element={<QR />} />
          <Route path="session" element={<Session />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
