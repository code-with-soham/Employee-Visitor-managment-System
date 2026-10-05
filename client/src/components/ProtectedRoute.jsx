import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // If no token exists, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required and user doesn't have them, redirect
  if (allowedRoles && !allowedRoles.includes(role)) {
    // If they have a role but it's wrong, send them to their own dashboard
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "employee") return <Navigate to="/employee" replace />;
    if (role === "visitor") return <Navigate to="/visitor/dashboard" replace />;
    
    // Fallback
    return <Navigate to="/login" replace />;
  }

  // Authorized, render the route
  return children;
};

export default ProtectedRoute;
