// src/pages/vendor/VendorOrderDetails.tsx
import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Row, Col, Table } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';
import { Order } from '../../api/orders';

const VendorOrderDetails: React.FC = () => {
  // Store a single order or null (while loading or if there's an error)
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { order_uuid } = useParams<{ order_uuid: string }>();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/vendor/orders/${order_uuid}/`);
        console.log('Order details response:', response.data);
        // The backend returns a single Order
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
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
      <h2>Vendor Order Details</h2>

      <Link to="/vendor/orders">
        <Button variant="secondary" className="mb-3">&larr; Back to Order Management</Button>
      </Link>

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
                  <Button
                    variant="primary"
                    onClick={() => alert('Update order status functionality here!')}
                  >
                    Update Status
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


// // Working version
// import React, { useState, useEffect } from 'react';
// import { Container, Card, Button, Alert, Row, Col, Table } from 'react-bootstrap';
// import api from '../../api';
// import { useParams } from 'react-router-dom';
//
// const VendorOrderDetails: React.FC = () => {
//   const { order_uuid } = useParams<{ order_uuid: string }>();
//   const [order, setOrder] = useState<any | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//
//   useEffect(() => {
//     const fetchOrderDetails = async () => {
//       try {
//         // Make sure the route matches your Django URLs (e.g.: /vendor/orders/<uuid>/)
//         const response = await api.get(`/vendor/orders/${order_uuid}/`);
//         console.log('Order details response:', response.data);
//         // The single order is returned at the top level in response.data.
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
//       {/* Only render if we got an order object */}
//       {order && (
//         <>
//           {/* Top section: basic order info + status */}
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
//                   <p><strong>Total Amount:</strong> ${order.total_amount}</p>
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
//             {/* Shipping address on the right */}
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
//           {/* Order items table */}
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
//                         {order.items.map((item: any) => (
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
