// // src/pages/vendor/VendorOrders.tsx
// import React, { useEffect, useState } from 'react';
// import api from '../../api';
// import { Order } from '../../api/orders';
//
// const VendorOrders: React.FC = () => {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//
//   useEffect(() => {
//     const fetchVendorOrders = async () => {
//       try {
//         // Adjust this endpoint to match your DRF vendor orders URL.
//         const response = await api.get('/vendor/orders/');
//         setOrders(response.data);
//       } catch (error) {
//         console.error('Error fetching vendor orders:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchVendorOrders();
//   }, []);
//
//   if (loading) return <p>Loading orders...</p>;
//
//   return (
//     <div>
//       <h1>Your Orders</h1>
//       {orders.length === 0 ? (
//         <p>No orders found.</p>
//       ) : (
//         <ul>
//           {orders.map((order) => (
//             <li key={order.uuid}>
//               Order #{order.id} - Status: {order.status}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };
//
// export default VendorOrders;
