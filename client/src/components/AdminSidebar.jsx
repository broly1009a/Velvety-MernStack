import React, { useState } from "react";
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
import axios from "axios";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fullName =
    localStorage.getItem("fullName") || sessionStorage.getItem("fullName");
  const [showModal, setShowModal] = useState(false);

  const menuItems = [
    { name: "Consultant", path: "/consultant-management" },
    { name: "Staff", path: "/staff-management" },
  ];

  const handleLogout = () => {
    axios
      .post("/api/auth/logout")
      .then(() => {
        // ✅ Clear auth data from storage
        localStorage.removeItem("authToken");
        localStorage.removeItem("roleName");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("roleName");

        // ✅ Redirect user to login page
        navigate("/login");
      })
      .catch((error) => {
        console.error(
          "Logout failed:",
          error.response?.data?.message || error.message
        );
      })
      .finally(() => setShowModal(false));
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
      {/* Sidebar Title */}
      <Toolbar>
        <div
          className="w-[150px] h-[150px] bg-cover bg-center bg-no-repeat rounded-t-lg"
          style={{
            backgroundImage: `url(https://cdn2.iconfinder.com/data/icons/shopping-colorline/64/admin-512.png)`,
          }}
        />
      </Toolbar>
      <Typography variant="h6">
        <div className="text-center">
          Welcome Admin <br />
          {fullName}
        </div>
      </Typography>
      <Divider sx={{ backgroundColor: "gray" }} />

      {/* Menu List */}
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
        onClick={() => setShowModal(true)}
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
      {/* Custom Logout Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Log out Confirmation
            </h3>
            <p className="text-gray-600">Are you sure you want to log out?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="py-2 px-6 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="py-2 px-6 bg-[#e05151] text-white rounded-lg hover:bg-[#e78999] transition"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default AdminSidebar;
