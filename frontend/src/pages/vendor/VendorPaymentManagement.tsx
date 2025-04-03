// pages/vendor/VendorCartAggregationManagement.tsx

import React, { useState, useEffect } from 'react';
import { Container, Table, Alert } from 'react-bootstrap';
import api from '../../api';

const VendorPaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get('/vendor/dashboard/payments/');
        setPayments(response.data.results);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError('Failed to fetch payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-5">
      <h2>Vendor Payment Management</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Payment ID</th>
            <th>UUID</th>
            <th>Order ID</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td>{payment.id}</td>
              <td>{payment.uuid}</td>
              <td>{payment.order}</td>
              <td>${payment.amount}</td>
              <td>{payment.status}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default VendorPaymentManagement;
