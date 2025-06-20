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
      setError("New passwords do not match.");
      return;
    }

    if (!passwordRegex.test(formData.newPassword)) {
      setError("Password must be at least 8 characters, include uppercase, lowercase, number, and special character.");
      return;
    }

    try {
      const response = await axios.post("/api/auth/change-password", {
        userId,
        currentPassword: formData.CurrentPassword,
        newPassword: formData.newPassword,
      });

      setSuccess(response.data.message);
      setTimeout(() => navigate(roleName === "Admin" ? "/staff-management" : "/dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={5} p={3} boxShadow={3} borderRadius={2}>
      <Typography variant="h5" gutterBottom>Change Password</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Current Password"
          type={showCurrentPassword ? "text" : "password"}
          name="CurrentPassword"
          fullWidth
          required
          margin="normal"
          onChange={handleChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                  {showCurrentPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="New Password"
          type={showNewPassword ? "text" : "password"}
          name="newPassword"
          fullWidth
          required
          margin="normal"
          onChange={handleChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                  {showNewPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Confirm New Password"
          type={showConfirmNewPassword ? "text" : "password"}
          name="confirmPassword"
          fullWidth
          required
          margin="normal"
          onChange={handleChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} edge="end">
                  {showConfirmNewPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Update Password
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
        Back
      </Button>
    </Box>
  );
};

export default ChangePassword;
