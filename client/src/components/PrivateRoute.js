// client/src/components/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function PrivateRoute({ children, role }) {
  const userRole = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token || !userRole) {
    // Redirect to the appropriate login page based on the required role
    return <Navigate to={`/${role.toLowerCase()}/login`} state={{ from: location.pathname }} />;
  }

  // Case-insensitive role comparison
  if (userRole.toLowerCase() !== role.toLowerCase()) {
    // If roles don't match, redirect to the appropriate login page
    return <Navigate to={`/${role.toLowerCase()}/login`} state={{ from: location.pathname }} />;
  }

  return children;
}

export default PrivateRoute;
