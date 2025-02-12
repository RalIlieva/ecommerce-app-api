import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api';

export interface OrderItem {
  id: string;
  product: {
    name: string;
  };
  quantity: number;
  price: number;
}

export interface Order {
  uuid: string;
  id: string;
  status: string;
  created: string;
  items: OrderItem[];
}

const OrderPage: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { order_uuid } = useParams<{ order_uuid: string }>();

  useEffect(() => {
    if (user && order_uuid) {
      fetchOrderDetails(order_uuid);
    }
  }, [user, order_uuid]);

  const fetchOrderDetails = async (orderUUID: string) => {
    try {
      const response = await api.get(`/orders/${orderUUID}/`);
      console.log('Order Details Fetched:', response.data);  // Log the order data for debugging
//     const response = await api.get(`/orders/orders/`);
      setOrder(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch order details.');
    }
  };

  if (!user) {
    return (
      <div className="container text-center mt-5">
        <p>You must be logged in to view this page.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center mt-5">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading order...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h4>Order #{order.uuid} - {order.status}</h4>
      <p>Created on: {new Date(order.created).toLocaleDateString()}</p>

      <ul className="list-group">
        {order.items?.map((item) => (
          <li key={item.id} className="list-group-item">
            {item.name} (x{item.quantity}) - ${item.price ? parseFloat(item.price.toString()).toFixed(2) : 'N/A'}
          </li>
        ))}
      </ul>

      <Link to="/profile/:uuid" className="btn btn-primary mt-4">Back to Profile</Link>
    </div>
  );
};

export default OrderPage;
