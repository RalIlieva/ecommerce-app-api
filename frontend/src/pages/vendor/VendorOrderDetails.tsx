import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import api from '../../api';
import { useParams } from 'react-router-dom';

const VendorOrderDetails: React.FC = () => {
  const { order_uuid } = useParams<{ order_uuid: string }>();
  const [order, setOrder] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Make sure the route matches your Django URLs (here: /vendor/orders/<uuid>/).
        const response = await api.get(`/vendor/orders/${order_uuid}/`);
        console.log('Order details response:', response.data);
        // The single order is returned at the top level in response.data:
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
      <h2>Order Details</h2>

      {/* Render only if we got an order object */}
      {order && (
        <Card>
          <Card.Body>
            <Card.Title>Order ID: {order.id}</Card.Title>
            <Card.Text>UUID: {order.uuid}</Card.Text>
            <Card.Text>Status: {order.status}</Card.Text>
            <Card.Text>Created: {new Date(order.created).toLocaleString()}</Card.Text>
            <Card.Text>Modified: {new Date(order.modified).toLocaleString()}</Card.Text>
            <Card.Text>User (ID): {order.user}</Card.Text>
            <Card.Text>Total Amount: {order.total_amount}</Card.Text>

            <h5>Order Items</h5>
            {order.items && order.items.length > 0 ? (
              <ul>
                {order.items.map((item: any) => (
                  <li key={item.id}>
                    {item.product.name} — Quantity: {item.quantity} — Price: ${item.price}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No items for this order.</p>
            )}

            <h5>Shipping Address</h5>
            {order.shipping_address ? (
              <>
                <p>Full Name: {order.shipping_address.full_name}</p>
                <p>Address Line 1: {order.shipping_address.address_line_1}</p>
                <p>Address Line 2: {order.shipping_address.address_line_2}</p>
                <p>City: {order.shipping_address.city}</p>
                <p>Postal Code: {order.shipping_address.postal_code}</p>
                <p>Country: {order.shipping_address.country}</p>
                <p>Phone Number: {order.shipping_address.phone_number}</p>
              </>
            ) : (
              <p>No shipping address found.</p>
            )}

            <Button
              variant="primary"
              onClick={() => alert('Updating status functionality here!')}
            >
              Update Status
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default VendorOrderDetails;

// import React, { useState, useEffect } from 'react';
// import { Container, Card, Button, Alert } from 'react-bootstrap';
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
//         // Make sure your endpoint is correct. Often it'll be `/vendor/orders/${order_uuid}/`.
//         // If not sure, log the response and check what it looks like in dev tools.
//         const response = await api.get(`/vendor/orders/${order_uuid}/`);
//         console.log('Order details response:', response.data);
//
//         // If your API returns a single order object at the top level
//         // (like { id: 1, items: [...], ... }),
//         // do this:
//         setOrder(response.data);
//
//         // If your backend returns { order: { id: 1, items: [...], ... } },
//         // you’d do setOrder(response.data.order) instead.
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
//       <h2>Order Details</h2>
//
//       {/* Render only if we got an order */}
//       {order && (
//         <Card>
//           <Card.Body>
//             <Card.Title>Order ID: {order.id}</Card.Title>
//             <Card.Text>Status: {order.status}</Card.Text>
//             <Card.Text>Created: {new Date(order.created).toLocaleString()}</Card.Text>
//             <Card.Text>User (ID): {order.user}</Card.Text>
//
//             <h5>Order Items</h5>
//             {order.items && order.items.length > 0 ? (
//               <ul>
//                 {order.items.map((item: any) => (
//                   <li key={item.id}>
//                     {item.product.name} - Quantity: {item.quantity} - Price: ${item.price}
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p>No items for this order.</p>
//             )}
//
//             <Button
//               variant="primary"
//               onClick={() => alert('Updating status functionality here!')}
//             >
//               Update Status
//             </Button>
//           </Card.Body>
//         </Card>
//       )}
//     </Container>
//   );
// };
//
// export default VendorOrderDetails;
