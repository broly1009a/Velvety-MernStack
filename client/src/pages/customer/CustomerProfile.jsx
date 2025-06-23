import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
  InputAdornment,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import axios from "../../utils/axiosInstance";
import CustomerSidebar from "@/components/CustomerSidebar";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import { Fab } from "@mui/material";

const CustomerProfile = () => {
  const userId =
    localStorage.getItem("userId") || sessionStorage.getItem("userId");
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      const { data } = await axios.get(`/api/customers/${userId}`);
      setCustomer(data);
    } catch (error) {
      console.error("Error fetching customer data", error);
    }
  };

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/customers/${userId}`, customer); // Change to PUT for updating
      setIsEditing(false);
      setSuccess("Thông tin đã được cập nhật thành công!");
      localStorage.removeItem("fullName");
      localStorage.setItem(
        "fullName",
        `${customer.firstName} ${customer.lastName}`
      );
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setError("Lỗi khi cập nhật thông tin. Vui lòng thử lại.");
      console.error("Error updating profile", error);
    }
  };

  const handlePasswordUpdate = async () => {
    setError("");
    setSuccess("");

    if (!formData.currentPassword) {
      setError("Mật khẩu hiện tại là bắt buộc.");
      return;
    }

    if (!formData.newPassword) {
      setError("Mật khẩu mới là bắt buộc.");
      return;
    }

    if (!passwordRegex.test(formData.newPassword)) {
      setError(
        "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
      );
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    try {
      await axios.post(`/api/customers/change-password`, {
        userId, // Fixing uppercase issue
        currentPassword: formData.currentPassword, // Fixing uppercase issue
        newPassword: formData.newPassword,
      });
      setSuccess("Mật khẩu đã được cập nhật thành công!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Lỗi khi cập nhật mật khẩu. Vui lòng thử lại."
      );
      console.error("Error updating password:", error);
    }
  };

  return (
    <div className="main-container w-full h-full bg-[#d4ccd0] relative mx-auto my-0">
      <div className="flex">
        <div className="w-[250px] min-w-[250px]">
          <CustomerSidebar />
        </div>
        <div className="flex-1 p-4">
          <Box p={4} maxWidth="800px" mx="auto">
            <Card
              sx={{
                p: 4,
                boxShadow: 4,
                borderRadius: 4,
                backgroundColor: "#ffffff",
              }}
            >
              <CardContent>
                <Box textAlign="center">
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: "auto",
                      mb: 2,
                      color: "white",
                      bgcolor: "#c86c79",
                    }}
                  >
                    Người dùng
                  </Avatar>
                  <Typography variant="h6" className="text-[#c86c79]">
                    {customer.firstName} {customer.lastName}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <IconButton onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? (
                      <SaveIcon
                        color="primary"
                        sx={{
                          backgroundColor: "#E27585",
                          color: "white",
                          "&:hover": { backgroundColor: "#a92a4e" },
                        }}
                      />
                    ) : (
                      <EditIcon
                        sx={{
                          backgroundColor: "#E27585",
                          color: "white",
                          "&:hover": { backgroundColor: "#a92a4e" },
                        }}
                      />
                    )}
                  </IconButton>
                </Box>
                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}
                <Typography
                  variant="h6"
                  gutterBottom
                  mt={2}
                  className="text-[#c86c79]"
                >
                  Thông tin cá nhân
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Tên"
                      name="firstName"
                      fullWidth
                      value={customer.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "gray", // Default border color
                          },
                          "&:hover fieldset": {
                            borderColor: "#E27585", // Border color on hover
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#daacac", // Border color when focused
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: "#000000", // Changes the text color inside the field
                        },
                        "& .MuiInputLabel-root": {
                          color: "gray", // Default label color
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#E27585", // Label color when focused
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Họ"
                      name="lastName"
                      fullWidth
                      value={customer.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "gray", // Default border color
                          },
                          "&:hover fieldset": {
                            borderColor: "#E27585", // Border color on hover
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#daacac", // Border color when focused
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: "#000000", // Changes the text color inside the field
                        },
                        "& .MuiInputLabel-root": {
                          color: "gray", // Default label color
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#E27585", // Label color when focused
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Số điện thoại"
                      name="phoneNumber"
                      fullWidth
                      value={customer.phoneNumber}
                      onChange={handleChange}
                      disabled={!isEditing}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "gray", // Default border color
                          },
                          "&:hover fieldset": {
                            borderColor: "#E27585", // Border color on hover
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#daacac", // Border color when focused
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: "#000000", // Changes the text color inside the field
                        },
                        "& .MuiInputLabel-root": {
                          color: "gray", // Default label color
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#E27585", // Label color when focused
                        },
                      }}
                    />
                  </Grid>
                </Grid>
                <br />
                {isEditing && (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{
                      backgroundColor: "#E27585",
                      color: "white",
                      "&:hover": { backgroundColor: "#a92a4e" },
                    }}
                    onClick={handleSave}
                  >
                    Lưu Thay Đổi
                  </Button>
                )}
                <Typography
                  variant="h6"
                  gutterBottom
                  mt={4}
                  className="text-[#c86c79]"
                >
                  Cập nhật mật khẩu
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Mật khẩu Hiện Tại"
                      name="currentPassword"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "gray", // Default border color
                          },
                          "&:hover fieldset": {
                            borderColor: "#E27585", // Border color on hover
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#daacac", // Border color when focused (clicked)
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: "#000000", // Changes the text color inside the field
                        },
                        "& .MuiInputLabel-root": {
                          color: "gray", // Default label color
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#E27585", // Label color when focused
                        },
                      }}
                      type={showCurrentPassword ? "text" : "password"}
                      fullWidth
                      value={formData.currentPassword}
                      onChange={handlePasswordChange}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                            >
                              {showCurrentPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Mật khẩu Mới"
                      name="newPassword"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "gray", // Default border color
                          },
                          "&:hover fieldset": {
                            borderColor: "#E27585", // Border color on hover
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#daacac", // Border color when focused (clicked)
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: "#000000", // Changes the text color inside the field
                        },
                        "& .MuiInputLabel-root": {
                          color: "gray", // Default label color
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#E27585", // Label color when focused
                        },
                      }}
                      type={showNewPassword ? "text" : "password"}
                      fullWidth
                      value={formData.newPassword}
                      onChange={handlePasswordChange}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                            >
                              {showNewPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Xác Nhận Mật Khẩu Mới"
                      name="confirmPassword"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "gray", // Default border color
                          },
                          "&:hover fieldset": {
                            borderColor: "#E27585", // Border color on hover
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#daacac", // Border color when focused (clicked)
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: "#000000", // Changes the text color inside the field
                        },
                        "& .MuiInputLabel-root": {
                          color: "gray", // Default label color
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#E27585", // Label color when focused
                        },
                      }}
                      type={showConfirmNewPassword ? "text" : "password"}
                      fullWidth
                      value={formData.confirmPassword}
                      onChange={handlePasswordChange}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowConfirmNewPassword(
                                  !showConfirmNewPassword
                                )
                              }
                            >
                              {showConfirmNewPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                <br />
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#E27585",
                    color: "white",
                    "&:hover": { backgroundColor: "#a92a4e" },
                  }}
                  fullWidth
                  onClick={handlePasswordUpdate}
                >
                  Cập nhật mật khẩu
                </Button>
              </CardContent>
            </Card>
          </Box>
          <Fab
            color="primary"
            aria-label="home"
            onClick={() => navigate("/")}
            sx={{
              position: "fixed",
              bottom: 20,
              right: 20,
              backgroundColor: "#E27585",
              "&:hover": { backgroundColor: "#a92a4e" },
            }}
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a92a4e] opacity-75"></span>
            <HomeIcon />
          </Fab>;
        </div>
      </div>
    </div>

  );
};

export default CustomerProfile;
