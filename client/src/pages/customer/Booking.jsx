import React, { useState } from "react";
import { Box, Typography, Card, CardContent, Button, TextField } from "@mui/material";

const BookingPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    datetime: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.datetime) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Đặt lịch thành công!");
        setFormData({ name: "", email: "", phone: "", datetime: "" });
      } else {
        alert("Có lỗi xảy ra, vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#f4f4f4" }}>
      <Card sx={{ width: 400, p: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Đặt Lịch Hẹn
          </Typography>
          <TextField fullWidth label="Tên khách hàng" name="name" value={formData.name} onChange={handleChange} margin="normal" />
          <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} margin="normal" />
          <TextField fullWidth label="Số điện thoại" name="phone" value={formData.phone} onChange={handleChange} margin="normal" />
          <TextField fullWidth label="Ngày & Giờ" name="datetime" type="datetime-local" value={formData.datetime} onChange={handleChange} margin="normal" />
          <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleSubmit}>
            Xác nhận đặt lịch
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BookingPage;
