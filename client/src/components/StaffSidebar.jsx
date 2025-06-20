import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import axios from "../utils/axiosInstance";

const StaffSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fullName =
    localStorage.getItem("fullName") || sessionStorage.getItem("fullName");

  const menuItems = [{ name: "Booking Request", path: "/view-booking" }];
  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    axios
      .post("/api/auth/logout")
      .then(() => {
        // Clear auth data from storage
        localStorage.removeItem("authToken");
        localStorage.removeItem("roleName");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("roleName");

        // Redirect user to login page
        navigate("/login");
      })
      .catch((error) => {
        console.error(
          "Logout failed:",
          error.response?.data?.message || error.message
        );
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
        <div
          className="w-[150px] h-[150px] bg-cover bg-center bg-no-repeat rounded-t-lg"
          style={{
            backgroundImage: `url(https://cdn-icons-png.flaticon.com/512/3789/3789820.png)`,
          }}
        />
      </Toolbar>
      <Typography variant="h6">
        <div className="text-center">
          Welcome Staff <br /> {fullName}
        </div>
      </Typography>
      <Divider sx={{ backgroundColor: "gray" }} />

      {/* Danh sách menu */}
      <List>
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <ListItemButton selected={location.pathname === item.path}>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </NavLink>
        ))}
      </List>

      {/* Change Password Button */}
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
        Change Password
      </Button>

      {/* Logout Button */}
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
        Logout
      </Button>
    </Drawer>
  );
};

export default StaffSidebar;
