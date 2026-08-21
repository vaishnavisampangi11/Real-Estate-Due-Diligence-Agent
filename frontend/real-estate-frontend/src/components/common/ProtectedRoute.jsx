import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isTokenValid, clearAuthData } from "../../services/authService";
import { getCurrentUserRole, isRoleAllowed } from "../../utils/roleUtils";

function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!isTokenValid(token)) {
    clearAuthData();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = getCurrentUserRole();
    if (!isRoleAllowed(userRole, allowedRoles)) {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  return children;
}

export default ProtectedRoute;

