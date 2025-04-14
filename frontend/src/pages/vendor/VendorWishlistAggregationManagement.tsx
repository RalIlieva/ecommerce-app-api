// pages/vendor/VendorWishlistAggregationManagement.tsx
import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Button } from 'react-bootstrap';
import api from '../../api';
import { Link } from 'react-router-dom';

const VendorWishlistAggregationManagement: React.FC = () => {
  const [aggregatedWishlist, setAggregatedWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAggregatedWishlist = async () => {
      try {
        const response = await api.get('vendor/dashboard/wishlist/aggregation/');
        setAggregatedWishlist(response.data);
      } catch (err) {
        console.error('Error fetching aggregated wishlist data:', err);
        setError('Failed to fetch aggregated wishlist data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAggregatedWishlist();
  }, []);

  if (loading) return <p>Loading aggregated wishlist data...</p>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-5">
      <h2>Aggregated Wishlist Data</h2>
      <Link to="/vendor/dashboard">
        <Button variant="secondary" className="mb-3">&larr; Back to Dashboard</Button>
      </Link>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Wishlist Count</th>
          </tr>
        </thead>
        <tbody>
          {aggregatedWishlist.map(item => (
            <tr key={item.product__id}>
              <td>{item.product__id}</td>
              <td>{item.product__name}</td>
              <td>{item.wishlist_count}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default VendorWishlistAggregationManagement;
