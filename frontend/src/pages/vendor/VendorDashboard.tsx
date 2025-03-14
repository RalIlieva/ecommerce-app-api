// src/pages/vendor/VendorDashboard.tsx
import React, { useEffect, useState } from 'react';
import api from '../../api';

interface DashboardStats {
  orders: number;
  sales: number;
  products: number;
}

const VendorDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Adjust the endpoint based on your DRF vendor dashboard endpoint.
        const response = await api.get('/vendor/dashboard/');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!stats) return <p>No data available.</p>;

  return (
    <div className="container mt-5">
      <h2>Vendor Dashboard</h2>
      <div>
        <p>Total Orders: {stats.orders}</p>
        <p>Total Sales: ${stats.sales}</p>
        <p>Total Products: {stats.products}</p>
      </div>
    </div>
  );
};

export default VendorDashboard;

// // src/pages/vendor/VendorDashboard.tsx
// import React, { useEffect, useState } from 'react';
// import api from '../../api';
//
// interface DashboardStats {
//   orders: number;
//   sales: number;
//   products: number;
// }
//
// const VendorDashboard: React.FC = () => {
//   const [stats, setStats] = useState<DashboardStats | null>(null);
//   const [loading, setLoading] = useState(true);
//
//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         // Adjust the endpoint as per your DRF vendor dashboard URL.
//         const response = await api.get('/vendor/dashboard/');
//         setStats(response.data);
//       } catch (error) {
//         console.error('Error fetching dashboard stats:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchStats();
//   }, []);
//
//   if (loading) return <p>Loading...</p>;
//   if (!stats) return <p>No data available.</p>;
//
//   return (
//     <div>
//       <h1>Vendor Dashboard</h1>
//       <div>
//         <p>Total Orders: {stats.orders}</p>
//         <p>Total Sales: ${stats.sales}</p>
//         <p>Total Products: {stats.products}</p>
//       </div>
//     </div>
//   );
// };
//
// export default VendorDashboard;
