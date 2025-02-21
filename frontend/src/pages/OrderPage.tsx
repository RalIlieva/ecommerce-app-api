// src/pages/OrderPage.tsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api';
import { Order } from '../api/orders';

const OrderPage: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { order_uuid } = useParams<{ order_uuid: string }>();

  useEffect(() => {
    if (user && order_uuid) {
      fetchOrderDetails(order_uuid);
    }
  }, [user, order_uuid]);

  const fetchOrderDetails = async (orderUUID: string) => {
    try {
      const response = await api.get(`/orders/${orderUUID}/`);
      console.log('Order Details Fetched:', response.data);
      setOrder(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch order details.');
    }
  };

  if (!user) {
    return (
      <div className="container text-center mt-5">
        <p>You must be logged in to view this page.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center mt-5">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading order...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            {/* Card Header */}
            <div className="card-header d-flex align-items-center">
              <h4 className="mb-0">Order #{order.uuid}</h4>
              {/* Badge for status */}
              <span className="ms-auto badge bg-primary text-uppercase">
                {order.status}
              </span>
            </div>

            {/* Card Body */}
            <div className="card-body">
              <p>
                <strong>Created on: </strong>
                {new Date(order.created).toLocaleDateString()}
              </p>

              {typeof order.total_amount !== 'undefined' && (
                <p>
                  <strong>Order Total: </strong>${order.total_amount}
                </p>
              )}

               {/* Show shipping_address if it's returned by the serializer */}
              {order.shipping_address && (
                <div className="card mt-3 p-3">
    <h5>Shipping Address</h5>
    <p><strong>Name:</strong> {order.shipping_address.full_name}</p>
    <p><strong>Address:</strong> {order.shipping_address.address_line_1}, {order.shipping_address.address_line_2}</p>
    <p><strong>City:</strong> {order.shipping_address.city}</p>
    <p><strong>Postal Code:</strong> {order.shipping_address.postal_code}</p>
    <p><strong>Country:</strong> {order.shipping_address.country}</p>
    <p><strong>Phone:</strong> {order.shipping_address.phone_number}</p>
  </div>
//                 <p>
//                   <strong>Shipped to:</strong> {order.shipping_address}
//                 </p>
              )}

              <hr />

              <h5 className="card-title mb-3">Items</h5>
              <ul className="list-group mb-4">
                {order.items?.map((item) => (
                  <li key={item.id} className="list-group-item">
                    <strong>{item.product.name}</strong> (x{item.quantity})
                    <span className="float-end">
                      ${item.price
                        ? parseFloat(item.price.toString()).toFixed(2)
                        : 'N/A'}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Back Button */}
              <Link
                to={`/profile/${user.profile_uuid}`}
                className="btn btn-primary"
              >
                Back to Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;



// // src/pages/OrderPage.tsx
// import React, { useState, useEffect, useContext } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import AuthContext from '../context/AuthContext';
// import api from '../api';
// import { Order, OrderItem } from '../api/orders';
//
// const OrderPage: React.FC = () => {
//   const { user } = useContext(AuthContext);
//   const [order, setOrder] = useState<Order | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const { order_uuid } = useParams<{ order_uuid: string }>();
//
//   useEffect(() => {
//     if (user && order_uuid) {
//       fetchOrderDetails(order_uuid);
//     }
//   }, [user, order_uuid]);
//
//   const fetchOrderDetails = async (orderUUID: string) => {
//     try {
//       const response = await api.get(`/orders/${orderUUID}/`);
//       console.log('Order Details Fetched:', response.data);  // Log the order data for debugging
//       setOrder(response.data);
//     } catch (err: any) {
//       console.error(err);
//       setError('Failed to fetch order details.');
//     }
//   };
//
//   if (!user) {
//     return (
//       <div className="container text-center mt-5">
//         <p>You must be logged in to view this page.</p>
//       </div>
//     );
//   }
//
//   if (error) {
//     return (
//       <div className="container text-center mt-5">
//         <p className="text-danger">{error}</p>
//       </div>
//     );
//   }
//
//   if (!order) {
//     return (
//       <div className="container text-center mt-5">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading order...</span>
//         </div>
//       </div>
//     );
//   }
//
//   return (
//     <div className="container mt-5">
//       <h4>Order #{order.uuid} - {order.status}</h4>
//       {/* Show total_amount if available */}
//       {typeof order.total_amount !== 'undefined' && (
//         <p>Order Total: ${order.total_amount}</p>
//       )}
//
//       <p>Created on: {new Date(order.created).toLocaleDateString()}</p>
//
//       <ul className="list-group">
//         {order.items?.map((item) => (
//           <li key={item.id} className="list-group-item">
//             {item.product.name} (x{item.quantity}) - ${item.price ? parseFloat(item.price.toString()).toFixed(2) : 'N/A'}
//           </li>
//         ))}
//       </ul>
//
//     <Link to={`/profile/${user.profile_uuid}`} className="btn btn-primary mt-4">Back to Profile</Link>
//
//     </div>
//   );
// };
//
// export default OrderPage;
