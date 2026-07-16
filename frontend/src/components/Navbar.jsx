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
import React from "react";
import LOGOw from "../assets/logo.png";
import WButton from "./WButton";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { LogoutUser } from "../store/slices/authSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="fixed w-full bg-black/80 backdrop-blur-3xl border-b-[0.7px]  border-white/10 z-50">
      <div className="relative flex items-center justify-between px-4 md:px-16 lg:px-40 py-5">
        <img
          onClick={() => navigate("/")}
          src={LOGOw}
          alt="sharexpress logo"
          className="h-12 object-contain"
          style={{ cursor: "pointer" }}
        />

        <div className="absolute left-1/2 -translate-x-1/2 flex gap-9  ">
          <h1 className="text-[#B8B8B8] hover:text-[#909090] transition-all duration-150 cursor-pointer font-[400]">
            How it Works
          </h1>
          <h1 className="text-[#B8B8B8] hover:text-[#909090] transition-all duration-150 cursor-pointer font-[400]">
            Features
          </h1>
          <h1 className="text-[#B8B8B8] hover:text-[#909090] transition-all duration-150 cursor-pointer font-[400]">
            Security
          </h1>
          <h1 className="text-[#B8B8B8] hover:text-[#909090] transition-all duration-150 cursor-pointer font-[400]">
            Questions
          </h1>
          <h1 className="text-[#B8B8B8] hover:text-[#909090] transition-all duration-150 cursor-pointer font-[400]">
            Docs
          </h1>
        </div>

        <div className="flex gap-3 items-center">
          {user ? (
            <>
              <div
                onClick={() => dispatch(LogoutUser())}
                className=" transition-all text-white duration-150 ease-in-out cursor-pointer hover:border-white/30     bg-transparent px-5 py-2   rounded-4xl border-[1px] border-white/20 text-center text-md font-[400]  "
              >
                Sign out
              </div>

              <button onClick={() => navigate(user.is_guest ? "/dashboard/QR" : "/dashboard")}>
                <WButton text={"Go to Dashboard"} />
              </button>
            </>
          ) : (
            <>
              <div
                onClick={() => navigate("/signin")}
                className=" transition-all text-white duration-150 ease-in-out cursor-pointer hover:border-white/30     bg-transparent px-5 py-2   rounded-4xl border-[1px] border-white/20 text-center text-md font-[400]  "
              >
                Sign in
              </div>

              <button onClick={() => navigate("/dashboard")}>
                <WButton text={"Get Started"} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
