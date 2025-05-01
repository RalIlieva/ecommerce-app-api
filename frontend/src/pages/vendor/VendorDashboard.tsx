// src/pages/vendor/VendorDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api';

const VendorDashboard: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch vendor dashboard stats on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/vendor/dashboard/dashboard/');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-5">
      <h2>Vendor Dashboard</h2>

      {/* Total Stats Section */}
      <Row className="mb-4">
        <Col xs={12} sm={6} lg={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Orders</Card.Title>
              <Card.Text>{stats.total_orders}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Revenue</Card.Title>
              <Card.Text>${parseFloat(stats.total_revenue).toFixed(2)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Products</Card.Title>
              <Card.Text>{stats.total_products}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions Section */}
      <Row className="mb-4">
        <Col>
          <Link to="/vendor/products">
            <Button variant="primary" className="w-100">Manage Products</Button>
          </Link>
        </Col>
        <Col>
          <Link to="/vendor/orders">
            <Button variant="primary" className="w-100">Manage Orders</Button>
          </Link>
        </Col>
        <Col>
          <Link to="/vendor/payments">
            <Button variant="primary" className="w-100">Manage Payments</Button>
          </Link>
        </Col>
      </Row>
      {/* New Quick Actions for Aggregated Data */}
      <Row className="mb-4">
        <Col>
          <Link to="/vendor/cart/aggregation">
            <Button variant="secondary" className="w-100">View Cart Aggregation</Button>
          </Link>
        </Col>
        <Col>
          <Link to="/vendor/wishlist/aggregation">
            <Button variant="secondary" className="w-100">View Wishlist Aggregation</Button>
          </Link>
        </Col>
      </Row>

      {/* Top Products */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>Top Products</Card.Header>
            <Card.Body>
              <ul>
                {stats.products.slice(0, 5).map((product: any) => (
                  <li key={product.id}>
                    {product.name} - ${product.price}
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders Section */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>Recent Orders</Card.Header>
            <Card.Body>
              <ul>
                {stats.orders.slice(0, 5).map((order: any) => (
                  <li key={order.id}>
                    Order ID: {order.id} | Status: {order.status} | Created: {order.created}
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VendorDashboard;
