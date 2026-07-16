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
import StartHeroCard from "./StartHeroCard";

const StartHero = () => {
  const accessModes = [
    {
      id: 1,
      badge: "Free",
      title: "Guest Mode",
      subtitle: "Instant sharing. No account required.",
      buttonText: "Start as Guest",
      highlight: false,
      features: [
        "Temporary sharing session",
        "QR-based device pairing",
        "Auto-expiring files",
        "Time-limited uploads",
        "Basic download access",
      ],
    },
    {
      id: 2,
      badge: "Recommended*",
      title: "Registered Mode",
      subtitle: "Full control. Persistent workspace.",
      buttonText: "Create Account",
      highlight: true,
      features: [
        "Persistent sharing sessions",
        "Role-based permission engine",
        "Single editor lock mode",
        "Advanced expiry controls",
        "Session history & tracking",
        "Personal storage quota",
      ],
    },
  ];
  return (
    <>
      <div className="w-full min-h-screen py-16 flex flex-col justify-center gap-0">
        <div className="flex justify-center">
          <div className="max-w-md">
            <h1 className="text-white text-center text-[48px] font-[500] leading-[1.1] ">
              Choose how you want to share{" "}
            </h1>
            <h3 className="text-[#B8B8B8] text-center mt-3   ">
              Flexible access modes for instant transfers or persistent control.
            </h3>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-10 mt-20">
          {accessModes.map((mode) => (
            <StartHeroCard key={mode.id} data={mode} />
          ))}
        </div>{" "}
      </div>
    </>
  );
};

export default StartHero;
