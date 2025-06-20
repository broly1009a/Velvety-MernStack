import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = ({ user }) => {
  if (!user) {
    return <Outlet />; // Allow guests to access public pages
  }

  // Redirect users based on their role
  const roleRedirects = {
    Admin: "/staff-management",
    Manager: "/dashboard",
    Staff: "/view-booking",
    Consultant: "/view-booked",
    Customer: "/booking", // Optional: Redirect customers to their main page
  };

  return <Navigate to={roleRedirects[user.role] || "/"} replace />;
};

export default PublicRoute;
