import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function VerifyEmailPage() {
  const [message, setMessage] = useState("Verifying...");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const requestSent = useRef(false); // Prevent multiple requests

  useEffect(() => {
    if (!token) {
      setMessage("Invalid verification link.");
      return;
    }

    if (requestSent.current) return; // Prevent multiple calls
    requestSent.current = true; // Mark as sent

    axios
      .get(`/api/auth/verify?token=${token}`)
      .then((response) => {
        setMessage(response.data.message);
        setTimeout(() => navigate("/login"), 3000);
      })
      .catch((error) => {
        setMessage(error.response?.data?.message || "Verification failed.");
      });

  }, [token, navigate]);

  return (
    <div className="h-screen flex justify-center items-center bg-[#f9faef]">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-[#c86c79]">Email Verification</h2>
        <p className="mt-4 text-gray-700">{message}</p>
      </div>
    </div>
  );
}
