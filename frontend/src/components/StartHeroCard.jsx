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
import WButton from "./WButton";
import { FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const StartHeroCard = ({ data }) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (data.id === 1) {
      navigate("/dashboard");
    } else {
      navigate("/signin");
    }
  };

  return (
    <div className="w-full md:w-1/2 bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 transition-all duration-300 ">
      <div className="text-white text-md "> {data.badge} </div>

      <h2 className="text-white text-2xl font-medium mt-6"> {data.title} </h2>

      <p className="text-[#B8B8B8] mt-2">{data.subtitle}</p>
      <div className="my-5">
        <WButton text={data.buttonText} onClick={handleAction} typeB={true} />
      </div>

      <div className="h-px bg-white/10 my-3  " />
      <ul className="space-y-3 text-[#B8B8B8] text-sm">
        {data.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <FaCheck className="text-green-500 mt-[3px] text-xs" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StartHeroCard;
