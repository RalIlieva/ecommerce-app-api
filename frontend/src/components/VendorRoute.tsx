// src/components/VendorRoute.tsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const VendorRoute: React.FC = () => {
  const { user } = useContext(AuthContext);

  // Check if the user exists and has a 'vendor' group.
  if (!user || !user.groups || !user.groups.includes('vendor')) {
    // Optionally redirect to vendor login or show an error.
    return <Navigate to="/vendor/login" replace />;
  }

  return <Outlet />;
};

export default VendorRoute;
