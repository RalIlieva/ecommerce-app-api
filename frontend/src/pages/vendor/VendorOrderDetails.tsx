// src/pages/vendor/VendorOrderDetails.tsx
import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Row, Col, Table, Form } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';
import { Order } from '../../api/orders';

const VendorOrderDetails: React.FC = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<string>('');

  const { order_uuid } = useParams<{ order_uuid: string }>();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/vendor/orders/${order_uuid}/`);
        setOrder(response.data);
        setNewStatus(response.data.status); // Set current status as default
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [order_uuid]);

  const handleStatusUpdate = async () => {
    if (!order) return;

    try {
      const response = await api.patch(`/vendor/orders/${order.uuid}/status/`, {
        status: newStatus,
      });

      setOrder(response.data);
      setSuccessMessage('Order status updated successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-5">
      <h2>Vendor Order Details</h2>

      <Link to="/vendor/orders">
        <Button variant="secondary" className="mb-3">&larr; Back to Order Management</Button>
      </Link>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {order && (
        <>
          <Row>
            <Col md={6} className="mb-3">
              <Card>
                <Card.Header>Order Overview</Card.Header>
                <Card.Body>
                  <p><strong>Order ID:</strong> {order.id}</p>
                  <p><strong>UUID:</strong> {order.uuid}</p>
                  <p><strong>Status:</strong> {order.status}</p>
                  <p><strong>Created:</strong> {new Date(order.created).toLocaleString()}</p>
                  <p><strong>Modified:</strong> {new Date(order.modified).toLocaleString()}</p>
                  <p><strong>User (ID):</strong> {order.user}</p>
                  {order.total_amount && (
                    <p><strong>Total Amount:</strong> ${order.total_amount}</p>
                  )}

                  <Form.Group controlId="statusSelect" className="mb-3 mt-3">
                    <Form.Label>Update Order Status</Form.Label>
                    <Form.Select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </Form.Group>

                  <Button variant="primary" onClick={handleStatusUpdate}>
                    Save Status
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-3">
              <Card>
                <Card.Header>Shipping Address</Card.Header>
                <Card.Body>
                  {order.shipping_address ? (
                    <>
                      <p><strong>Full Name:</strong> {order.shipping_address.full_name}</p>
                      <p><strong>Address Line 1:</strong> {order.shipping_address.address_line_1}</p>
                      <p><strong>Address Line 2:</strong> {order.shipping_address.address_line_2}</p>
                      <p><strong>City:</strong> {order.shipping_address.city}</p>
                      <p><strong>Postal Code:</strong> {order.shipping_address.postal_code}</p>
                      <p><strong>Country:</strong> {order.shipping_address.country}</p>
                      <p><strong>Phone Number:</strong> {order.shipping_address.phone_number}</p>
                    </>
                  ) : (
                    <p>No shipping address found.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col>
              <Card>
                <Card.Header>Order Items</Card.Header>
                <Card.Body>
                  {order.items && order.items.length > 0 ? (
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item.id}>
                            <td>{item.product.name}</td>
                            <td>{item.quantity}</td>
                            <td>${item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p>No items for this order.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default VendorOrderDetails;


// // src/pages/vendor/VendorOrderDetails.tsx
// import React, { useState, useEffect } from 'react';
// import { Container, Card, Button, Alert, Row, Col, Table } from 'react-bootstrap';
// import { useParams, Link } from 'react-router-dom';
// import api from '../../api';
// import { Order } from '../../api/orders';
//
// const VendorOrderDetails: React.FC = () => {
//   // Store a single order or null (while loading or if there's an error)
//   const [order, setOrder] = useState<Order | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//
//   const { order_uuid } = useParams<{ order_uuid: string }>();
//
//   useEffect(() => {
//     const fetchOrderDetails = async () => {
//       try {
//         const response = await api.get(`/vendor/orders/${order_uuid}/`);
//         console.log('Order details response:', response.data);
//         // The backend returns a single Order
//         setOrder(response.data);
//       } catch (err) {
//         console.error('Error fetching order details:', err);
//         setError('Failed to fetch order details.');
//       } finally {
//         setLoading(false);
//       }
//     };
//
//     fetchOrderDetails();
//   }, [order_uuid]);
//
//   if (loading) return <p>Loading...</p>;
//   if (error) return <Alert variant="danger">{error}</Alert>;
//
//   return (
//     <Container className="mt-5">
//       <h2>Vendor Order Details</h2>
//
//       <Link to="/vendor/orders">
//         <Button variant="secondary" className="mb-3">&larr; Back to Order Management</Button>
//       </Link>
//
//       {order && (
//         <>
//           <Row>
//             <Col md={6} className="mb-3">
//               <Card>
//                 <Card.Header>Order Overview</Card.Header>
//                 <Card.Body>
//                   <p><strong>Order ID:</strong> {order.id}</p>
//                   <p><strong>UUID:</strong> {order.uuid}</p>
//                   <p><strong>Status:</strong> {order.status}</p>
//                   <p><strong>Created:</strong> {new Date(order.created).toLocaleString()}</p>
//                   <p><strong>Modified:</strong> {new Date(order.modified).toLocaleString()}</p>
//                   <p><strong>User (ID):</strong> {order.user}</p>
//                   {order.total_amount && (
//                     <p><strong>Total Amount:</strong> ${order.total_amount}</p>
//                   )}
//                   <Button
//                     variant="primary"
//                     onClick={() => alert('Update order status functionality here!')}
//                   >
//                     Update Status
//                   </Button>
//                 </Card.Body>
//               </Card>
//             </Col>
//
//             <Col md={6} className="mb-3">
//               <Card>
//                 <Card.Header>Shipping Address</Card.Header>
//                 <Card.Body>
//                   {order.shipping_address ? (
//                     <>
//                       <p><strong>Full Name:</strong> {order.shipping_address.full_name}</p>
//                       <p><strong>Address Line 1:</strong> {order.shipping_address.address_line_1}</p>
//                       <p><strong>Address Line 2:</strong> {order.shipping_address.address_line_2}</p>
//                       <p><strong>City:</strong> {order.shipping_address.city}</p>
//                       <p><strong>Postal Code:</strong> {order.shipping_address.postal_code}</p>
//                       <p><strong>Country:</strong> {order.shipping_address.country}</p>
//                       <p><strong>Phone Number:</strong> {order.shipping_address.phone_number}</p>
//                     </>
//                   ) : (
//                     <p>No shipping address found.</p>
//                   )}
//                 </Card.Body>
//               </Card>
//             </Col>
//           </Row>
//
//           <Row>
//             <Col>
//               <Card>
//                 <Card.Header>Order Items</Card.Header>
//                 <Card.Body>
//                   {order.items && order.items.length > 0 ? (
//                     <Table striped bordered hover responsive>
//                       <thead>
//                         <tr>
//                           <th>Product</th>
//                           <th>Quantity</th>
//                           <th>Price</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {order.items.map((item) => (
//                           <tr key={item.id}>
//                             <td>{item.product.name}</td>
//                             <td>{item.quantity}</td>
//                             <td>${item.price}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </Table>
//                   ) : (
//                     <p>No items for this order.</p>
//                   )}
//                 </Card.Body>
//               </Card>
//             </Col>
//           </Row>
//         </>
//       )}
//     </Container>
//   );
// };
//
// export default VendorOrderDetails;
