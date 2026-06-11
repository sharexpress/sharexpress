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
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import PrivacyPolicyPage from "../pages/PrivacyPolicyPage";
import TermsOfServicePage from "../pages/TermsOfServicePage";
import SecurityPolicyPage from "../pages/SecurityPolicyPage";
import Signin from "../pages/Signin";
import Dashboard from "../pages/Dashboard";
import NotFound from "../components/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/security" element={<SecurityPolicyPage />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/dashboard/*" element={<Dashboard />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
