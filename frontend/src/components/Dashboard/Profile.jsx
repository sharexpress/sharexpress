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
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateUser,
  getCurrentUser,
  LogoutUser,
} from "../../store/slices/authSlice";
import { toast } from "react-toastify";
import ProfileSkeleton from "../Dashboard/ProfileSkeleton";

const Profile = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const [name, setName] = useState(user?.user_name);

  useEffect(() => {
    if (user) {
      setName(user.user_name);
    }
  }, [user]);

  const handleChange = (e) => {
    const value = e.target.value;

    setName(value);
  };
  const dispatch = useDispatch();
  const handleUpdateChanges = async () => {
    if (name === user.user_name) {
      toast.info("No changes to save");
      return;
    }

    if (name.trim() === "" || name.length == 0) {
      toast.error("Name is required");
    }

    try {
      await dispatch(updateUser(name)).unwrap();
      await dispatch(getCurrentUser()).unwrap();

      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err || "Failed to update profile");
    }
  };
  const initial = user?.user_name?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <div className="ml-0 md:ml-[260px] flex-1 p-3 pt-20 md:pt-3">
        <div className="w-full h-full bg-[#0d0d0d] rounded-xl border border-[#ffffff10] p-6">
          {/* TITLE */}
          <h1 className="text-white text-lg font-medium mb-10">
            Account Settings
          </h1>

          <div className="w-full flex justify-center">
            {loading ? (
              <ProfileSkeleton />
            ) : (
              <>
                <div className="w-[600px] flex flex-col gap-4">
                  <h2 className="text-white text-sm">Profile</h2>

                  <div className="bg-[#171717] border border-[#ffffff10] rounded-2xl overflow-hidden">
                    <div className="p-6 flex items-center gap-4 border-b border-[#ffffff10]">
                      <div className="h-20 w-20 rounded-full overflow-hidden bg-[#222] flex items-center justify-center text-white text-lg font-medium">
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
                    </div>

                    <div className="p-6 border-b border-[#ffffff10] flex flex-col gap-2">
                      <label className="text-xs text-[#a3a3a3]">
                        Display Name
                      </label>

                      <input
                        type="text"
                        value={name}
                        onChange={handleChange}
                        className="w-full bg-[#212121] border border-[#ffffff10] transition-all duration-300 ease-in-out rounded-4xl px-3 py-2 text-sm text-white outline-none focus:border-[#ffffff30]"
                      />
                    </div>

                    <div className="p-6 flex flex-col gap-2">
                      <label className="text-xs text-[#a3a3a3]">Email</label>

                      <input
                        type="text"
                        value={user?.email}
                        disabled
                        className="w-full hover:cursor-not-allowed bg-[#212121] border border-[#ffffff10] rounded-4xl px-3 py-2 text-sm text-[#777] outline-none"
                      />

                      <p className="text-xs text-[#6b6b6b]">
                        Email cannot be changed here. Contact support to update
                        your email.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      disabled={loading}
                      onClick={handleUpdateChanges}
                      className="bg-white text-black text-sm px-5 py-2 rounded-full cursor-pointer hover:bg-[#cfcfcf] transition disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
