import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Drawer, List, ListItemButton, ListItemText, Toolbar, Typography, Divider, Button } from "@mui/material";
import axios from "../utils/axiosInstance";

axios.defaults.withCredentials = true;

const ConsultantSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fullName = localStorage.getItem("fullName") || sessionStorage.getItem("fullName");
  const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
  const [averageRating, setAverageRating] = useState("N/A");

  useEffect(() => {
    axios.get(`/api/feedbacks/consultant-rating/${userId}`)
      .then(response => {
        setAverageRating(response.data[0].averageRating?.toFixed(1) || "N/A");
        console.log("Average rating:", response.data);


      })
      .catch(error => {
        console.error("Error fetching average rating:", error);
      });
  }, []);

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
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
          style={{ backgroundImage: `url(https://cdn2.iconfinder.com/data/icons/shopping-colorline/64/admin-512.png)` }}
        />
      </Toolbar>
      <Typography variant="h6">
        <div className="text-center">
          Welcome consultant <br />
          {fullName}
        </div>
        <div className="text-center text-sm text-gray-300">
          ⭐ Average Rating: {averageRating}
        </div>
      </Typography>
      <Divider sx={{ backgroundColor: "gray" }} />

      <List>
        <NavLink to="/view-booked" style={{ textDecoration: "none", color: "inherit" }}>
          <ListItemButton selected={location.pathname === "/view-booked"}>
            <ListItemText primary="Work Schedule" />
          </ListItemButton>
        </NavLink>
      </List>

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
          "&:hover": { backgroundColor: "#1565c0" },
        }}
      >
        Change Password
      </Button>

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
          "&:hover": { backgroundColor: "#d32f2f" },
        }}
      >
        Logout
      </Button>
    </Drawer>
  );
};

export default ConsultantSidebar;
