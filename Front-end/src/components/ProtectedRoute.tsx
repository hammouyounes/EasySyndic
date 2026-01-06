import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const userString = localStorage.getItem('user');
  let user: any = null;

  try {
    if (userString) {
      user = JSON.parse(userString);
    }
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    localStorage.removeItem('user');
  }


  if (!user) {
    console.warn("Unauthorized access attempt. Redirecting to login.");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const userRole = user.role ? user.role.toLowerCase() : '';
    
    if (!allowedRoles.includes(userRole)) {
      console.warn(`User role ${user.role} not authorized for this route. Redirecting.`);
      if (userRole === 'proprietaire') {
        return <Navigate to="/proprietaire" replace />;
      } else if (userRole === 'admin') {
        return <Navigate to="/" replace />;
      } else {
        return <Navigate to="/login" replace />;
      }
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
