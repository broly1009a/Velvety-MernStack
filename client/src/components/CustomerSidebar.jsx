import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Drawer, List, ListItemButton, ListItemText, Toolbar, Typography, Divider, Button, Box } from "@mui/material";
import axios from "axios";

const CustomerSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fullName = localStorage.getItem("fullName") || sessionStorage.getItem("fullName");
  const [showModal, setShowModal] = useState(false);

  const menuItems = [
    { name: "Account Details", path: "/customer-profile" },
    { name: "Booking History", path: "/booking-history" },
    { name: "Quiz Result History", path: "/quiz-result-history" },
  ];

  const handleLogout = () => {
    axios.post("/api/auth/logout")
      .then(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("roleName");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("roleName");
        navigate("/login");
      })
      .catch(error => {
        console.error("Logout failed:", error.response?.data?.message || error.message);
      })
      .finally(() => setShowModal(false));
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 260,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 260,
          backgroundColor: "#f9faef",
          color: "#c86c79",
          padding: "10px",
        },
      }}
    >
      <Toolbar sx={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0" }}>
        <Box
          sx={{
            width: 100,
            height: 100,
            backgroundImage: `url(https://www.pngplay.com/wp-content/uploads/7/Customer-Logo-Transparent-File.png)`,
            backgroundSize: "cover",
            borderRadius: "50%",
            marginBottom: 2,
          }}
        />
        <Typography variant="h6" sx={{ color: "#c86c79", textAlign: "center" }}>
          Welcome <br /> {fullName}
        </Typography>
      </Toolbar>
      <Divider sx={{ backgroundColor: "#E27585" }} />

      <List>
        {menuItems.map((item) => (
          <NavLink key={item.name} to={item.path} style={{ textDecoration: "none", color: "inherit" }}>
            <ListItemButton selected={location.pathname === item.path} sx={{ "&.Mui-selected": { backgroundColor: "#E27585", color: "white" } }}>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </NavLink>
        ))}
      </List>

      <Button
        onClick={() => setShowModal(true)}
        sx={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          backgroundColor: "#E27585",
          color: "white",
          "&:hover": {
            backgroundColor: "#a85663",
          },
          fontSize: "14px",
        }}
      >
        Logout
      </Button>

      {/* Custom Logout Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Log out Confirmation</h3>
            <p className="text-gray-600">Are you sure you want to log out?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="py-2 px-6 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="py-2 px-6 bg-[#f1baba] text-white rounded-lg hover:bg-[#e78999] transition"
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

export default CustomerSidebar;
