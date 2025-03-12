// src/pages/VendorDashboard.tsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api';

const VendorDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    if (!user || user.user_type !== 'vendor') {
      navigate('/vendor/login');
      return;
    }

    const fetchData = async () => {
      const response = await api.get('/vendor/dashboard/');
      setDashboardData(response.data);
    };

    fetchData();
  }, [user, navigate]);

  if (!dashboardData) return <p>Loading...</p>;

  return (
    <div className="container mt-5">
      <h2>Vendor Dashboard</h2>
      <p>Total Products: {dashboardData.total_products}</p>
      <p>Total Orders: {dashboardData.total_orders}</p>
      <p>Total Revenue: ${dashboardData.total_revenue}</p>
    </div>
  );
};

export default VendorDashboard;
