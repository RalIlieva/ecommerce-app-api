import React, { useState, useEffect } from 'react';
import { Button, Container, Alert, Table } from 'react-bootstrap';
import api from '../../api';
import { Link } from 'react-router-dom';

const VendorOrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/vendor/orders/');
        console.log('API response:', response.data);

        // The actual list of orders is in data.results
        // So we setOrders(response.data.results)
        setOrders(Array.isArray(response.data.results) ? response.data.results : []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-5">
      <h2>Vendor Order Management</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders && orders.length > 0 ? (
            orders.map((order: any) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.status}</td>
                <td>{new Date(order.created).toLocaleString()}</td>
                <td>
                  <Link to={`/vendor/orders/${order.uuid}`}>
                    <Button variant="info" size="sm">View Details</Button>
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>No orders found.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default VendorOrderManagement;
