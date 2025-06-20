import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useLocation } from "react-router-dom";
import { EyeIcon } from "lucide-react";
import { EyeOffIcon } from "lucide-react";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export default function ResetPassword() {
  const query = useQuery();
  const token = query.get("token");
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation function
  const validatePasswords = () => {
    let newErrors = {};

    if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long.";
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword)) {
      newErrors.newPassword =
        "Password must contain uppercase, lowercase, number, and special character.";
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    if (!validatePasswords()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/auth/reset-password?token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");

      setMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000); // Redirect after success
    } catch (err) {
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

      {/* Reset Password Section */}
      <div className="flex flex-grow items-center justify-center relative z-10 px-4">
        <div className="w-full max-w-md bg-white bg-opacity-90 backdrop-blur-lg shadow-lg rounded-2xl p-8">
          <h2 className="text-center text-2xl font-bold text-[#c86c79] uppercase mb-6">
            Reset Password
          </h2>

          {/* Success & Error Messages */}
          {message && <p className="text-green-600 text-center mb-4">{message}</p>}
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

          {/* Reset Password Form */}
          <form onSubmit={handleResetPassword}>
            {/* New Password Input */}
            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2 text-gray-700">New Password</label>
              <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, newPassword: "" })); // Clear error on change
                }}
                className="w-full h-12 px-4 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c86c79]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20}/>}
              </button>
              {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
            </div>
            </div>

            {/* Confirm Password Input */}
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-2 text-gray-700">Confirm Password</label>
              <div className="relative w-full">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, confirmPassword: "" })); // Clear error on change
                }}
                className="w-full h-12 px-4 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c86c79]"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20}/>}
              </button>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-full h-12 bg-[#c86c79] text-white text-lg font-semibold rounded-full shadow-md hover:bg-[#b25668] transition duration-300 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>

          {/* Back to Login */}
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