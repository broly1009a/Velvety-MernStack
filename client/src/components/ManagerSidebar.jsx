import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Drawer, List, ListItemButton, ListItemText, Toolbar, Typography, Divider, Button } from "@mui/material";
import axios from "axios";

const ManagerSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fullName = localStorage.getItem("fullName") || sessionStorage.getItem("fullName");

  const menuItems = [
    { name: "Bảng điều khiển", path: "/dashboard" },
    { name: "Dịch vụ", path: "/service-management" },
    { name: "Bài viết", path: "/blog-management" },
    { name: "Câu hỏi", path: "/question-management" }
  ];

  const handleLogout = () => {
    if (!window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) return;
    axios.post("/api/auth/logout")
      .then(() => {
        // ✅ Xóa dữ liệu xác thực khỏi bộ nhớ
        localStorage.removeItem("authToken");
        localStorage.removeItem("roleName");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("roleName");

        // ✅ Chuyển hướng người dùng đến trang đăng nhập
        navigate("/login");
      })
      .catch(error => {
        console.error("Đăng xuất thất bại:", error.response?.data?.message || error.message);
      });
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          backgroundColor: "#1a202c",
          color: "white",
          padding: "10px",
        },
      }}
    >
     <Toolbar>
        <div className="w-[150px] h-[150px] bg-cover bg-center bg-no-repeat rounded-t-lg" style={{ backgroundImage: `url(https://cdn0.iconfinder.com/data/icons/avatar-4/512/Manager-1024.png)` }} />
     </Toolbar>
     <Typography variant="h6">
        <div className="text-center">
             Xin chào Quản lý <br /> {fullName} 
        </div>
      </Typography>
      <Divider sx={{ backgroundColor: "gray" }} />

      {/* Danh sách menu */}
      <List>
        {menuItems.map((item) => (
          <NavLink key={item.name} to={item.path} style={{ textDecoration: "none", color: "inherit" }}>
            <ListItemButton selected={location.pathname === item.path}>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </NavLink>
        ))}
      </List>


      {/* Nút Đổi mật khẩu */}
      <Button
        onClick={() => navigate("/change-password")}
        sx={{
          position: "absolute",
          bottom: "60px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          backgroundColor: "#1976d2",
          color: "white",
          "&:hover": {
            backgroundColor: "#1565c0",
          },
        }}
      >
        Đổi mật khẩu
      </Button>

      {/* Nút Đăng xuất */}
      <Button
        onClick={handleLogout}
        sx={{
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          backgroundColor: "#f44336",
          color: "white",
          "&:hover": {
            backgroundColor: "#d32f2f",
          },
        }}
      >
        Đăng xuất
      </Button>
    </Drawer>
  );
};

export default ManagerSidebar;
