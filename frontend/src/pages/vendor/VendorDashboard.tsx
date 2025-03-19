// src/pages/vendor/VendorDashboard.tsx
import React, { useEffect, useState } from 'react';
import api from '../../api';

interface DashboardStats {
  orders: number;
  sales: number;
  products: number;
}

interface Product {
  id: string;
  uuid: string;
  name: string;
  price: number;
  category: string;
}

interface Order {
  id: string;
  uuid: string;
  user: string;
  status: string;
  created: string;
  modified: string;
}

interface Payment {
  id: string;
  uuid: string;
  order: string;
  amount: number;
  status: string;
}

const VendorDashboard: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Adjust the endpoint based on your DRF vendor dashboard endpoint.
        const response = await api.get('/vendor/dashboard/dashboard/');
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
        <p>Total Orders: {stats.total_orders}</p>
        <p>Total Sales: ${stats.total_revenue.toFixed(2)}</p>
        <p>Total Products: {stats.total_products}</p>
      </div>

      <h3>Products</h3>
      <ul>
        {stats.products.map((product: Product) => (
          <li key={product.id}>
            {product.name} - ${product.price} (Category: {product.category})
          </li>
        ))}
      </ul>

      <h3>Orders</h3>
      <ul>
        {stats.orders.map((order: Order) => (
          <li key={order.id}>
            Order ID: {order.id} | Status: {order.status} | Created: {order.created}
          </li>
        ))}
      </ul>

      <h3>Payments</h3>
      <ul>
        {stats.payments.map((payment: Payment) => (
          <li key={payment.id}>
            Payment ID: {payment.id} | Amount: ${payment.amount} | Status: {payment.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VendorDashboard;
