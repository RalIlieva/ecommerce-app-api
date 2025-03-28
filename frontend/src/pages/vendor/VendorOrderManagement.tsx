import React, { useState, useEffect } from 'react';
import { Button, Card, Container, Row, Col, Alert, Table } from 'react-bootstrap';
import api from '../../api';
import { Link } from 'react-router-dom';

const VendorOrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the orders for the vendor
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/vendor/orders/orders/');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
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

      {/* Order Table */}
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
          {orders.map((order: any) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.status}</td>
              <td>{new Date(order.created).toLocaleDateString()}</td>
              <td>
                <Link to={`/vendor/orders/${order.uuid}`}>
                  <Button variant="info" size="sm">View Details</Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default VendorOrderManagement;
