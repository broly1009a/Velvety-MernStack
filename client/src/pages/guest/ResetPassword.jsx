import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useLocation } from "react-router-dom";
import { EyeIcon } from "lucide-react";
import { EyeOffIcon } from "lucide-react";
import { axios } from "axios";
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
      newErrors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự.";
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword)) {
      newErrors.newPassword =
        "Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt.";
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp.";
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
      const response = await axios.post(`/api/auth/reset-password`, {
        token,
        newPassword,
        confirmPassword,
      });
      if (response.status === 200) {
        setMessage("Mật khẩu đã được đặt lại thành công.");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError("Không thể đặt lại mật khẩu. Vui lòng thử lại sau.");
      }
    }
    catch (err) {
      console.error("Lỗi khi đặt lại mật khẩu:", err);
      setError(
        err.response?.data?.message ||
          "Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại sau."
      );
    }
    setLoading(false);
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
            Đặt lại mật khẩu
          </h2>

          {/* Success & Error Messages */}
          {message && <p className="text-green-600 text-center mb-4">{message}</p>}
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

          {/* Reset Password Form */}
          <form onSubmit={handleResetPassword}>
            {/* New Password Input */}
            <div className="mb-4">
              <label className="block text-lg font-semibold mb-2 text-gray-700">Mật khẩu mới</label>
              <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu mới"
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
              <label className="block text-lg font-semibold mb-2 text-gray-700">Xác nhận mật khẩu</label>
              <div className="relative w-full">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Xác nhận mật khẩu mới"
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
                {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
              </button>
            </div>
          </form>

          {/* Back to Login */}
          <div className="text-center mt-4 text-gray-700">
            <span>Bạn đã nhớ mật khẩu? </span>
            <a href="/login" className="font-semibold text-[#c86c79] hover:underline">
              Đăng nhập
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}