import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api';
import { Order } from '../../api/orders';

const VendorOrderManagement: React.FC = () => {
  // 2) Use `Order[]` to get type safety for the orders array
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/vendor/orders/');
        // 3) The array of orders is in response.data.results
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

    fetchOrders();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-5">
      <h2>Vendor Order Management</h2>

      <Link to="/vendor/dashboard">
          <Button variant="secondary">&larr; Back to Dashboard</Button>
      </Link>

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
    </Container>
  );
};

export default VendorOrderManagement;


// import React, { useState, useEffect } from 'react';
// import { Container, Table, Alert, Button } from 'react-bootstrap';
// import { Link } from 'react-router-dom';
// import api from '../../api';
// import { Order } from '../../api/orders';
//
// const VendorOrderManagement: React.FC = () => {
//   const [orders, setOrders] = useState<any[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//
//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const response = await api.get('/vendor/orders/');
//         // In backend response - the array is inside "results".
//         // Ensure orders is always an array:
//         const results = Array.isArray(response.data.results)
//           ? response.data.results
//           : [];
//         setOrders(results);
//       } catch (err) {
//         console.error('Error fetching orders:', err);
//         setError('Failed to fetch orders.');
//       } finally {
//         setLoading(false);
//       }
//     };
//
//     fetchOrders();
//   }, []);
//
//   if (loading) return <p>Loading...</p>;
//   if (error) return <Alert variant="danger">{error}</Alert>;
//
//   return (
//     <Container className="mt-5">
//       <h2>Vendor Order Management</h2>
//       <Table striped bordered hover responsive>
//         <thead>
//           <tr>
//             <th>Order ID</th>
//             <th>UUID</th>
//             <th>Status</th>
//             <th>Created</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {orders.length > 0 ? (
//             orders.map((order) => (
//               <tr key={order.id}>
//                 <td>{order.id}</td>
//                 {/* Add UUID as a new column */}
//                 <td>{order.uuid}</td>
//                 <td>{order.status}</td>
//                 <td>{new Date(order.created).toLocaleString()}</td>
//                 <td>
//                   {/* Use order.uuid in the link to match your detail page route */}
//                   <Link to={`/vendor/orders/${order.uuid}`}>
//                     <Button variant="info" size="sm">View Details</Button>
//                   </Link>
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan={5}>No orders found.</td>
//             </tr>
//           )}
//         </tbody>
//       </Table>
//     </Container>
//   );
// };
//
// export default VendorOrderManagement;
