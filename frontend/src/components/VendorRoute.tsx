// // src/components/VendorRoute.tsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const VendorRoute: React.FC = () => {
  const { user, loading } = useContext(AuthContext);

  // Handle loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // If no user is logged in or the user is not a vendor, redirect to login or show an error message
  if (!user || !user.groups || !user.groups.includes('vendor')) {
    return <Navigate to="/vendor/login" replace />;
  }

  return <Outlet />;
};

export default VendorRoute;
