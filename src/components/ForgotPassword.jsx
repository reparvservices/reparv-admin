import React, { useState, useEffect } from "react";
import { IoMail } from "react-icons/io5";
import axios from "axios";
import { useAuth } from "../store/auth";
import Loader from "../components/Loader";

function ForgotPassword({ setShowForgotPassword }) {
  const { URI, setLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    ""
  );

  // Email Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  const gateNewPassword = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!email) {
      setErrorMessage("Email is required.");
      return;
    }

    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${URI}/admin/login/forgot-password`,
        { email },
        { withCredentials: true }
      );
      setSuccessMessage(response.data.message);
      setEmail("");
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] bg-white shadow-md rounded-[12px] py-[30px] px-[32px] flex flex-col items-start gap-[22px]">
      <div className="w-full flex items-center justify-between gap-2">
        <h2 className="text-[24px] font-bold text-gray-800">
          Forgot Password..!
        </h2>
        <Loader />
      </div>

      <p className="text-[18px] font-normal text-gray-900">
        Enter Your Register Email for getting new password
      </p>

      {/* Error Message */}
      {errorMessage && (
        <p className="text-red-500 text-sm ml-1">{errorMessage}</p>
      )}

      {/* Error Message */}
      {successMessage && (
        <div className="text-lg ml-1">
          <p className="text-[#0BB501]">{successMessage}</p>
        </div>
      )}

      {/* Email Input */}
      <div className="group w-full max-w-[340px] h-[60px] flex items-center border border-black/20 rounded-full px-[26px] focus-within:border-[#0BB501]">
        <IoMail className="text-black/20 w-[24px] h-[24px] mr-[10px] group-focus-within:text-[#0BB501]" />
        <input
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email Address"
          className="w-full border-none outline-none text-[14px]"
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={gateNewPassword}
        className="w-full max-w-[340px] h-[53px] bg-[#0BB501] text-white rounded-full text-[16px] font-semibold transition hover:text-[#fffcfc] active:scale-95"
      >
        GET New Password
      </button>

      {/* Forgot Password */}
      <p
        onClick={() => {
          setShowForgotPassword(false);
        }}
        className="w-full max-w-[300px] text-[16px] font-medium ml-1 text-black/70 leading-[17px] cursor-pointer text-left"
      >
        Login Here..!
      </p>
    </div>
  );
}

export default ForgotPassword;
