// src/pages/vendor/VendorOrderManagement.tsx
import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api';
import { Order } from '../../api/orders';

const VendorOrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchUuid, setSearchUuid] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/vendor/orders/', { params: filters });
      const results = Array.isArray(response.data.results)
        ? response.data.results
        : [];
      setOrders(results);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filters: any = {};
    if (searchUuid) filters.uuid = searchUuid;
    if (searchEmail) filters.email = searchEmail;

    if (startDate) {
      const start = new Date(startDate);
      filters.start_date = start.toISOString(); // Make it timezone-aware
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include full day
      filters.end_date = end.toISOString(); // Make it timezone-aware
    }

    fetchOrders(filters);
  };

  const handleClearFilters = () => {
    setSearchUuid('');
    setSearchEmail('');
    setStartDate('');
    setEndDate('');
    fetchOrders();
  };

  return (
    <Container className="mt-5">
      <h2>Vendor Order Management</h2>

      <Link to="/vendor/dashboard">
        <Button variant="secondary" className="mb-3">&larr; Back to Dashboard</Button>
      </Link>

      <Form className="mb-4">
        <Row>
          <Col md={3} className="mb-2">
            <Form.Group controlId="searchUuid">
              <Form.Label>Search by UUID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter UUID"
                value={searchUuid}
                onChange={(e) => setSearchUuid(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3} className="mb-2">
            <Form.Group controlId="searchEmail">
              <Form.Label>Search by User Email</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3} className="mb-2">
            <Form.Group controlId="startDate">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3} className="mb-2">
            <Form.Group controlId="endDate">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col md={3}>
            <Button variant="primary" onClick={handleSearch} className="me-2">
              Search
            </Button>
            <Button variant="outline-secondary" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Form>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status" />
          <p>Loading...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>UUID</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.uuid}</td>
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
                <td colSpan={5}>No orders found.</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default VendorOrderManagement;
