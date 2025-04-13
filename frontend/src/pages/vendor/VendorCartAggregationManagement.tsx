// Using Axios in VendorCartAggregationManagement.tsx

import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Button } from 'react-bootstrap';
import api from '../../api';
import { Link } from 'react-router-dom';

const VendorCartAggregationManagement: React.FC = () => {
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAggregatedCart = async () => {
      try {
        const response = await api.get('vendor/dashboard/cart/aggregation/');
        setAggregatedData(response.data);
      } catch (err) {
        console.error('Error fetching aggregated cart data:', err);
        setError('Failed to fetch aggregated cart data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAggregatedCart();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-5">
      <h2>Aggregated Cart Data</h2>

      <Link to="/vendor/dashboard">
        <Button variant="secondary" className="mb-3">&larr; Back to Dashboard</Button>
      </Link>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Total Quantity</th>
            <th>Number of Entries</th>
          </tr>
        </thead>
        <tbody>
          {aggregatedData.map((data) => (
            <tr key={data.product__id}>
              <td>{data.product__id}</td>
              <td>{data.product__name}</td>
              <td>{data.total_quantity}</td>
              <td>{data.item_count}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default VendorCartAggregationManagement;
