import React, { useState } from "react";
import Navbar from "../../components/Navbar";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the response is not ok, throw an error with the message from the server
        throw new Error(data.message || "Something went wrong");
      }

      setMessage("Password reset link sent! Check your email.");
      setEmail("");
    } catch (err) {
      // Display the error message (in case of user not found or other errors)
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#f9faef] relative">
      {/* Navbar */}
      <Navbar />

      {/* Background */}
      <div className="absolute inset-0 bg-[url(/images/forgotpassword_resetpassword.png)] bg-cover bg-center opacity-40" />

      {/* Forgot Password Section */}
      <div className="flex flex-grow items-center justify-center relative z-10 px-4">
        <div className="w-full max-w-md bg-white bg-opacity-90 backdrop-blur-lg shadow-lg rounded-2xl p-8">
          <h2 className="text-center text-2xl font-bold text-[#c86c79] uppercase mb-6">
            Forgot Password
          </h2>

          {/* Success & Error Messages */}
          {message && <p className="text-green-600 text-center mb-4">{message}</p>}
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

          {/* Email Input */}
          <form onSubmit={handleResetPassword}>
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-2 text-gray-700">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c86c79]"
                required
              />
            </div>

            {/* Reset Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-full h-12 bg-[#c86c79] text-white text-lg font-semibold rounded-full shadow-md hover:bg-[#b25668] transition duration-300 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Sending..." : "Reset Password"}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="text-center mt-4 text-gray-700">
            <span>Remember your password? </span>
            <a href="/login" className="font-semibold text-[#c86c79] hover:underline">
              Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
