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
import React, { useState, useRef, useEffect } from "react";
import LOGOw from "../assets/logo.png";
import google from "../images/google.png";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import WButton from "../components/WButton";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser, sendOTP, verifyOTP } from "../store/slices/authSlice";
import { toast } from "react-toastify";
import { API } from "../api/api";

const TRANSITION = {
  duration: 1,
  ease: [0.32, 0.72, 0, 1],
};

const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
    filter: "blur(4px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: TRANSITION,
  },
  exit: (dir) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
    filter: "blur(4px)",
    transition: { ...TRANSITION, duration: 0.28 },
  }),
};

function AutoHeight({ children }) {
  const innerRef = useRef(null);
  const [height, setHeight] = useState("auto");

  useEffect(() => {
    if (!innerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    });
    ro.observe(innerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <motion.div
      animate={{ height }}
      transition={{ ...TRANSITION, duration: 0.38 }}
      style={{ overflow: "hidden", position: "relative" }}
    >
      <div ref={innerRef}>{children}</div>
    </motion.div>
  );
}

const Signin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [transactionID, settransactionID] = useState(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const direction = step === "otp" ? 1 : -1;
  const inputRefs = useRef([]);
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setStep("otp");
  };

  const handleGoogleSign = () => {
    window.location.href = `${API}auth/google/login`;
  };

  const handleSendOTP = async () => {
    const response = await dispatch(sendOTP(email));

    settransactionID(response.payload.transactionID);
  };
  const handleOTPChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const VerifyOTPDATA = {
    OTP: otp.join(""),
    transactionID: transactionID,
  };

  console.log(VerifyOTPDATA);

  const handleVerifyOTP = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      toast.warning("Enter complete OTP");
      return;
    }

    try {
      await dispatch(
        verifyOTP({
          OTP: otpValue,
          transactionID,
        }),
      ).unwrap();

      navigate("/dashboard");
      const res = await dispatch(getCurrentUser()).unwrap();
      console.log(res);
      toast.success(`Welcome ${res?.user?.user_name || ""}`);
    } catch (err) {
      toast.error(err || "OTP verification failed");
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pasteData)) return;

    const newOtp = pasteData.split("");
    setOtp(newOtp);

    newOtp.forEach((digit, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = digit;
      }
    });
  };
  return (
    <div className="min-h-screen w-screen bg-[#262626] flex items-center justify-center">
      <div className="w-[420px]">
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        >
          <img src={LOGOw} alt="Sharexpress" className="h-12 object-contain" />
        </motion.div>

        {/* Card */}
        <motion.div
          className="bg-[#171717] border border-white/10 rounded-2xl p-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* AutoHeight prevents the card from snapping to new content size */}
          <AutoHeight>
            <AnimatePresence mode="popLayout" custom={direction}>
              {step === "email" && (
                <motion.div
                  key="email"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <h1 className="text-white text-center text-xl font-medium mb-6">
                    Welcome to Sharexpress
                  </h1>

                  <button
                    onClick={handleGoogleSign}
                    className="w-full cursor-pointer flex items-center justify-center gap-3 border border-white/10 rounded-4xl py-2.5 text-sm text-white hover:bg-white/5 transition"
                  >
                    <img src={google} alt="" className="h-5" />
                    Continue with Google
                  </button>

                  <div className="flex items-center gap-3 my-6">
                    <div className="h-px bg-white/10 flex-1" />
                    <span className="text-xs text-white/40">or</span>
                    <div className="h-px bg-white/10 flex-1" />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm text-[#909090] px-3">
                        Email
                      </label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        className="mt-1 w-full bg-[#1e1e1e] border border-white/10 rounded-4xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B8B8B8] transition-all duration-300 ease-in-out   "
                      />
                    </div>
                    <button
                      onClick={handleSendOTP}
                      type="submit"
                      className="w-full mt-4"
                    >
                      <WButton text={"Continue"} w_full={true} />
                    </button>
                  </form>

                  <p className="text-[#909090] text-sm text-start mt-5">
                    By clicking Continue, you agree to our{" "}
                    <span
                      onClick={() => navigate("/terms")}
                      className="underline cursor-pointer"
                    >
                      Terms
                    </span>{" "}
                    and{" "}
                    <span
                      onClick={() => navigate("/privacy")}
                      className="underline cursor-pointer"
                    >
                      Privacy Policies
                    </span>
                  </p>
                </motion.div>
              )}

              {step === "otp" && (
                <motion.div
                  key="otp"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <h1 className="text-white text-center text-xl font-medium mb-2">
                    Enter OTP
                  </h1>

                  <p className="text-center text-sm text-[#B8B8B8] mb-6">
                    We sent a code to {email}
                  </p>

                  <div className="flex justify-center gap-3 mb-6">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (inputRefs.current[i] = el)}
                        value={digit}
                        onPaste={handlePaste}
                        maxLength={1}
                        onChange={(e) => handleOTPChange(e.target.value, i)}
                        onKeyDown={(e) => handleKeyDown(e, i)}
                        className="w-10 h-12 text-center bg-[#1e1e1e] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                      />
                    ))}
                  </div>

                  <button onClick={handleVerifyOTP} className="w-full">
                    <WButton text={"Verify"} w_full={true} />
                  </button>

                  <p
                    onClick={() => setStep("email")}
                    className="text-center text-sm text-[#B8B8B8] mt-6 cursor-pointer hover:text-[#909090] transition"
                  >
                    Change email
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </AutoHeight>
        </motion.div>
      </div>
    </div>
  );
};

export default Signin;
