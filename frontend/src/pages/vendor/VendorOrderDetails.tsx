import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import api from '../../api';
import { useParams } from 'react-router-dom';

const VendorOrderDetails: React.FC = () => {
  const { order_uuid } = useParams<{ order_uuid: string }>();
  const [order, setOrder] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/vendor/orders/orders/${order_uuid}/`);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [order_uuid]);

  if (loading) return <p>Loading...</p>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-5">
      <h2>Order Details</h2>

      {order && (
        <Card>
          <Card.Body>
            <Card.Title>Order ID: {order.id}</Card.Title>
            <Card.Text>Status: {order.status}</Card.Text>
            <Card.Text>Created: {new Date(order.created).toLocaleDateString()}</Card.Text>
            <Card.Text>User: {order.user}</Card.Text>

            <h5>Order Items</h5>
            <ul>
              {order.items.map((item: any) => (
                <li key={item.id}>
                  {item.product.name} - Quantity: {item.quantity} - Price: ${item.price}
                </li>
              ))}
            </ul>

            <Button variant="primary" onClick={() => alert('Updating status functionality here!')}>
              Update Status
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default VendorOrderDetails;
