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
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Hero2 from "../components/Hero2";
import HeroCard from "../components/HeroCard";
import Hero3 from "../components/Hero3";
import Hero4 from "../components/Hero4";
import StartHero from "../components/StartHero";
import Images_Float from "../components/Images_Float";
import QuestionCard from "../components/QuestionCard";
import Questions from "../components/Questions";

const Home = () => {
  return (
    <>
      <div className=" h-fit min-w-screen bg-black  px-40 py-5  ">
        <Hero />
      </div>
      <div className=" h-2/3 min-w-screen bg-black  mb-20  ">
        <Images_Float />
      </div>

      <div className=" min-h-screen min-w-screen bg-black  px-40 py-5  ">
        <Hero2 />
        <HeroCard />
        <Hero3 />
        <Hero4 />
        <StartHero />
        <Questions />
      </div>
    </>
  );
};

export default Home;
