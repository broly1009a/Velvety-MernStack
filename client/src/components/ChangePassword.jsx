import React, { useState } from "react";
import { TextField, Button, Box, Typography, Alert, IconButton, InputAdornment } from "@mui/material";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import "react-toastify/dist/ReactToastify.css";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    CurrentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const roleName = localStorage.getItem("roleName") || sessionStorage.getItem("roleName");
  const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Mật khẩu mới không khớp.");
      return;
    }

    if (!passwordRegex.test(formData.newPassword)) {
      setError("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");
      return;
    }

    try {
      const response = await axios.post("/api/auth/change-password", {
        userId,
        currentPassword: formData.CurrentPassword,
        newPassword: formData.newPassword,
      });

      setSuccess("Đổi mật khẩu thành công!");
      setTimeout(() => navigate(roleName === "Admin" ? "/staff-management" : "/dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Đổi mật khẩu thất bại.");
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={5} p={3} boxShadow={3} borderRadius={2}>
      <Typography variant="h5" gutterBottom>Đổi mật khẩu</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Mật khẩu hiện tại"
          type={showCurrentPassword ? "text" : "password"}
          name="CurrentPassword"
          fullWidth
          required
          margin="normal"
          onChange={handleChange}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                    {showCurrentPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          label="Mật khẩu mới"
          type={showNewPassword ? "text" : "password"}
          name="newPassword"
          fullWidth
          required
          margin="normal"
          onChange={handleChange}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                    {showNewPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          label="Xác nhận mật khẩu mới"
          type={showConfirmNewPassword ? "text" : "password"}
          name="confirmPassword"
          fullWidth
          required
          margin="normal"
          onChange={handleChange}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} edge="end">
                    {showConfirmNewPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Cập nhật mật khẩu
        </Button>
      </form>
      <Button
        variant="outlined"
        color="secondary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={() => {
          switch (roleName) {
            case "Admin":
              navigate("/staff-management");
              break;
            case "Manager":
              navigate("/dashboard");
              break;
            case "Staff":
              navigate("/view-booking");
              break;
            case "Consultant":
              navigate("/view-booked");
              break;
            default:
              // fallback nếu roleName không khớp
              navigate("/not-authorized"); // hoặc trang nào bạn muốn
          }
        }}
      >
        Quay lại
      </Button>
    </Box>
  );
};

export default ChangePassword;
