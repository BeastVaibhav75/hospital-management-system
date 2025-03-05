// client/src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, role }) {
  const userRole = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  if (!token || userRole !== role) {
    return <Navigate to="/" />;
  }

  return children;
}

export default PrivateRoute;
