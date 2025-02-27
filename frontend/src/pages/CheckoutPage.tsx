import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api';

import { Cart, CheckoutSession, ShippingAddress } from '../api/types';

import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51QCRzCFopY0kiYaakR4B5pDCLOoeJPG4vsaA9jENSROVAxor1eM3qky0koQMbuZBTHZc2YuFw91hPpW5bNZ6TauR00GHqzUVEr');

const CheckoutPage: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle shipping addresses
  const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState<Partial<ShippingAddress>>({});

  const [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(null);

  useEffect(() => {
    const fetchCartAndAddresses = async () => {
      if (!user) {
        setLoadingCart(false);
        return;
      }
      try {
        // Fetch cart
        const cartRes = await api.get('/cart/');
        setCart(cartRes.data);

        // Temporarily disable fetching addresses to avoid 404 error
        setSavedAddresses([]); // Prevents UI errors

      } catch (err) {
        console.error(err);
        setError('Failed to fetch cart.');
      } finally {
        setLoadingCart(false);
      }
    };

    fetchCartAndAddresses();
  }, [user]);

  const handleStartCheckout = async () => {
  if (!cart) {
    alert('Your cart is empty. Please add items before checking out.');
    return;
  }

  if (!user || !user.uuid) {
    alert('You must be logged in to checkout.');
    return;
  }

  if (!selectedAddress && Object.values(newAddress).every(field => !field)) {
    alert('Please select an existing address or fill out a new one.');
    return;
  }

//   try {
//     const requestData = selectedAddress
//       ? { shipping_address: selectedAddress }
//       : { new_shipping_address: newAddress };
//
//     console.log("Checkout Request Data:", requestData); // Debugging log
//
//     const response = await api.post('/checkout/start/', requestData);
//     setCheckoutSession(response.data);
//   } catch (err: any) {
//     console.error("Checkout Error:", err.response ? err.response.data : err);
//
//     if (err.response && err.response.data.detail === 'Checkout session already exists for this cart.') {
//       alert("A checkout session already exists for this cart. Try completing your current checkout or refresh the page.");
//     } else {
//       alert('Failed to start checkout session.');
//     }
//   }
try {
  const requestData = selectedAddress
    ? { shipping_address: selectedAddress }
    : { new_shipping_address: newAddress };

  console.log("Checkout Request Data:", requestData); // Debugging log

  const response = await api.post('/checkout/start/', requestData);
  setCheckoutSession(response.data);
} catch (err: any) {
  console.error("Checkout Error:", err.response ? err.response.data : err);

  if (err.response) {
    const errorData = err.response.data;

    if (errorData.detail) {
      // Handle known errors
      if (errorData.detail === 'Checkout session already exists for this cart.') {
        alert("A checkout session already exists for this cart. Try completing your current checkout or refresh the page.");
        return;
      }

      alert(errorData.detail); // Generic error message from backend
      return;
    }

    // Handle validation errors (e.g., missing fields)
    if (typeof errorData === 'object') {
      const errorMessages = Object.entries(errorData)
        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
        .join("\n");

      alert(`Error(s):\n${errorMessages}`);
      return;
    }
  }

  // Fallback error message
  alert("Failed to start checkout session. Please try again.");
}
};


  return (
    <div className="container mt-5">
      <h2>Checkout</h2>
      {!checkoutSession ? (
        <div>
          {savedAddresses && savedAddresses.length > 0 && (
            <div className="mb-3">
              <label className="form-label">Select Shipping Address:</label>
              <select
                className="form-control"
                value={selectedAddress || ''}
                onChange={(e) => setSelectedAddress(e.target.value)}
              >
                <option value="">-- Select an Address --</option>
                {savedAddresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.full_name}, {addr.address_line_1}, {addr.city}, {addr.country}
                  </option>
                ))}
              </select>
            </div>
          )}
          <h4>Or Enter a New Shipping Address</h4>
          {['full_name', 'address_line_1', 'address_line_2', 'city', 'postal_code', 'country', 'phone_number'].map(field => (
            <div className="mb-3" key={field}>
              <label className="form-label">{field.replace('_', ' ').toUpperCase()}:</label>
              <input
                type="text"
                className="form-control"
                value={newAddress[field as keyof ShippingAddress] || ''}
                onChange={(e) => setNewAddress({ ...newAddress, [field]: e.target.value })}
                disabled={!!selectedAddress}
              />
            </div>
          ))}
          <button className="btn btn-primary" onClick={handleStartCheckout}>
            Proceed to Payment
          </button>
        </div>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret: checkoutSession.payment_secret || '' }}>
          <PaymentForm checkoutSession={checkoutSession} />
        </Elements>
      )}
    </div>
  );
};

const PaymentForm: React.FC<{ checkoutSession: CheckoutSession }> = ({ checkoutSession }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const handleConfirmPayment = async () => {
    if (!stripe || !elements) {
      alert('Stripe has not loaded yet.');
      return;
    }

    try {
      const result = await stripe.confirmCardPayment(
        checkoutSession.payment_secret || '',
        {
          payment_method: { card: elements.getElement(CardElement)! },
        }
      );

      if (result.error) {
        alert(result.error.message);
      } else if (result.paymentIntent?.status === 'succeeded') {
        await api.post(`/checkout/complete/${checkoutSession.uuid}/`);
        alert('Checkout completed successfully!');
        navigate('/');
      } else {
        alert('Payment failed.');
      }
    } catch (err) {
      alert('Error confirming payment.');
    }
  };

  return (
    <div className="mt-4">
      <h4>Enter Payment Details</h4>
      <div className="mb-3 border p-3 rounded">
        <CardElement />
      </div>
      <button className="btn btn-success" onClick={handleConfirmPayment}>
        Pay Now
      </button>
    </div>
  );
};

export default CheckoutPage;


// import React, { useEffect, useState, useContext } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import AuthContext from '../context/AuthContext';
// import api from '../api';
//
// import { Cart, CheckoutSession, ShippingAddress } from '../api/types';
//
// import { loadStripe } from '@stripe/stripe-js';
// import {
//   Elements,
//   CardElement,
//   useStripe,
//   useElements
// } from '@stripe/react-stripe-js';
//
// const stripePromise = loadStripe('pk_test_51QCRzCFopY0kiYaakR4B5pDCLOoeJPG4vsaA9jENSROVAxor1eM3qky0koQMbuZBTHZc2YuFw91hPpW5bNZ6TauR00GHqzUVEr');
//
// const CheckoutPage: React.FC = () => {
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();
//
//   const [cart, setCart] = useState<Cart | null>(null);
//   const [loadingCart, setLoadingCart] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//
//   // Temporarily disabling fetching saved addresses
//   const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([]);
//   const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
//   const [newAddress, setNewAddress] = useState<Partial<ShippingAddress>>({});
//
//   const [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(null);
//
//   useEffect(() => {
//     const fetchCartAndAddresses = async () => {
//       if (!user) {
//         setLoadingCart(false);
//         return;
//       }
//       try {
//         // Only fetch the cart (Skipping saved addresses request to prevent 404 error)
//         const cartRes = await api.get('/cart/');
//         setCart(cartRes.data);
//
//         // Skipping fetching saved addresses for now (prevents 404 error)
//         setSavedAddresses([]); // Ensures UI does not break due to undefined array
//
//       } catch (err) {
//         console.error(err);
//         setError('Failed to fetch cart.');
//       } finally {
//         setLoadingCart(false);
//       }
//     };
//
//     fetchCartAndAddresses();
//   }, [user]);
//
//   const handleStartCheckout = async () => {
//     if (!selectedAddress && Object.values(newAddress).every(field => !field)) {
//       alert('Please select an existing address or fill out a new one.');
//       return;
//     }
//
//     try {
//       const requestData = selectedAddress
//         ? { shipping_address: selectedAddress }
//         : { new_shipping_address: newAddress };
//
//       const response = await api.post('/checkout/start/', requestData);
//       setCheckoutSession(response.data);
//     } catch (err) {
//       console.error(err);
//       alert('Failed to start checkout session.');
//     }
//   };
//
//   return (
//     <div className="container mt-5">
//       <h2>Checkout</h2>
//       {!checkoutSession ? (
//         <div>
//           {savedAddresses && savedAddresses.length > 0 && ( // Prevent errors if undefined
//             <div className="mb-3">
//               <label className="form-label">Select Shipping Address:</label>
//               <select
//                 className="form-control"
//                 value={selectedAddress || ''}
//                 onChange={(e) => setSelectedAddress(e.target.value)}
//               >
//                 <option value="">-- Select an Address --</option>
//                 {savedAddresses.map((addr) => (
//                   <option key={addr.id} value={addr.id}>
//                     {addr.full_name}, {addr.address_line_1}, {addr.city}, {addr.country}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}
//           <h4>Or Enter a New Shipping Address</h4>
//           {['full_name', 'address_line_1', 'address_line_2', 'city', 'postal_code', 'country', 'phone_number'].map(field => (
//             <div className="mb-3" key={field}>
//               <label className="form-label">{field.replace('_', ' ').toUpperCase()}:</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 value={newAddress[field as keyof ShippingAddress] || ''}
//                 onChange={(e) => setNewAddress({ ...newAddress, [field]: e.target.value })}
//                 disabled={!!selectedAddress}
//               />
//             </div>
//           ))}
//           <button className="btn btn-primary" onClick={handleStartCheckout}>
//             Proceed to Payment
//           </button>
//         </div>
//       ) : (
//         <Elements stripe={stripePromise} options={{ clientSecret: checkoutSession.payment_secret || '' }}>
//           <PaymentForm checkoutSession={checkoutSession} />
//         </Elements>
//       )}
//     </div>
//   );
// };
//
// const PaymentForm: React.FC<{ checkoutSession: CheckoutSession }> = ({ checkoutSession }) => {
//   const stripe = useStripe();
//   const elements = useElements();
//   const navigate = useNavigate();
//
//   const handleConfirmPayment = async () => {
//     if (!stripe || !elements) {
//       alert('Stripe has not loaded yet.');
//       return;
//     }
//
//     try {
//       const result = await stripe.confirmCardPayment(
//         checkoutSession.payment_secret || '',
//         {
//           payment_method: { card: elements.getElement(CardElement)! },
//         }
//       );
//
//       if (result.error) {
//         alert(result.error.message);
//       } else if (result.paymentIntent?.status === 'succeeded') {
//         await api.post(`/checkout/complete/${checkoutSession.uuid}/`);
//         alert('Checkout completed successfully!');
//         navigate('/');
//       } else {
//         alert('Payment failed.');
//       }
//     } catch (err) {
//       alert('Error confirming payment.');
//     }
//   };
//
//   return (
//     <div className="mt-4">
//       <h4>Enter Payment Details</h4>
//       <div className="mb-3 border p-3 rounded">
//         <CardElement />
//       </div>
//       <button className="btn btn-success" onClick={handleConfirmPayment}>
//         Pay Now
//       </button>
//     </div>
//   );
// };
//
// export default CheckoutPage;


// // src/pages/CheckoutPage.tsx
// import React, { useEffect, useState, useContext } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import AuthContext from '../context/AuthContext';
// import api from '../api';
//
// import { Cart, CheckoutSession } from '../api/types';
//
// // 1) Import Stripe libraries
// import { loadStripe } from '@stripe/stripe-js';
// import {
//   Elements,
//   CardElement,
//   useStripe,
//   useElements
// } from '@stripe/react-stripe-js';
//
// // Replace with your real Stripe publishable key
// const stripePromise = loadStripe('pk_test_51QCRzCFopY0kiYaakR4B5pDCLOoeJPG4vsaA9jENSROVAxor1eM3qky0koQMbuZBTHZc2YuFw91hPpW5bNZ6TauR00GHqzUVEr');
//
// const CheckoutPage: React.FC = () => {
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();
//
//   // State to hold the user's cart
//   const [cart, setCart] = useState<Cart | null>(null);
//   const [loadingCart, setLoadingCart] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//
//   // Shipping address input
//   const [shippingAddress, setShippingAddress] = useState('');
//
//   // Once we start checkout, we get a CheckoutSession
//   const [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(null);
//
//   // 2) Fetch the user's cart on mount if logged in
//   useEffect(() => {
//     const fetchCart = async () => {
//       if (!user) {
//         setLoadingCart(false);
//         return;
//       }
//       try {
//         const response = await api.get('/cart/');
//         setCart(response.data);
//       } catch (err) {
//         console.error(err);
//         setError('Failed to fetch cart.');
//       } finally {
//         setLoadingCart(false);
//       }
//     };
//     fetchCart();
//   }, [user]);
//
//   // Handler to start the checkout session
//   const handleStartCheckout = async () => {
//     if (!shippingAddress.trim()) {
//       alert('Please enter a shipping address.');
//       return;
//     }
//     try {
//       // 3) Call /checkout/start/
//       const response = await api.post('/checkout/start/', {
//         shipping_address: shippingAddress
//       });
//       setCheckoutSession(response.data); // { uuid, payment_secret, status, etc. }
//     } catch (err) {
//       console.error(err);
//       alert('Failed to start checkout session.');
//     }
//   };
//
//   // Basic loading & error states
//   if (!user) {
//     return (
//       <div className="container mt-5">
//         <p>Please <Link to="/login">log in</Link> to check out.</p>
//       </div>
//     );
//   }
//
//   if (loadingCart) {
//     return (
//       <div className="container mt-5 text-center">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading cart...</span>
//         </div>
//       </div>
//     );
//   }
//
//   if (error) {
//     return (
//       <div className="container mt-5 text-center">
//         <p className="text-danger">{error}</p>
//       </div>
//     );
//   }
//
//   if (!cart || cart.items.length === 0) {
//     return (
//       <div className="container mt-5">
//         <h4>Your cart is empty!</h4>
//       </div>
//     );
//   }
//
//   return (
//     <div className="container mt-5">
//       <h2>Checkout</h2>
//
//       {!checkoutSession ? (
//         // Step 1: Collect shipping address, show cart summary
//         <div>
//           <div className="mb-3">
//             <label htmlFor="shippingAddress" className="form-label">
//               Shipping Address:
//             </label>
//             <textarea
//               id="shippingAddress"
//               className="form-control"
//               rows={2}
//               value={shippingAddress}
//               onChange={(e) => setShippingAddress(e.target.value)}
//             />
//           </div>
//
//           <h4>Cart Summary</h4>
//           <ul className="list-group mb-3">
//             {cart.items.map((item) => (
//               <li
//                 key={item.uuid}
//                 className="list-group-item d-flex justify-content-between align-items-center"
//               >
//                 <div>
//                   {item.product.name} (x{item.quantity})
//                 </div>
//                 <div>
//                   ${(item.product.price * item.quantity).toFixed(2)}
//                 </div>
//               </li>
//             ))}
//           </ul>
//
//           <button className="btn btn-primary" onClick={handleStartCheckout}>
//             Proceed to Payment
//           </button>
//         </div>
//       ) : (
//         // Step 2: We have a checkoutSession -> integrate Stripe for payment
//         <Elements
//           stripe={stripePromise}
//           options={{ clientSecret: checkoutSession.payment_secret || '' }}
//         >
//           <PaymentForm checkoutSession={checkoutSession} />
//         </Elements>
//       )}
//     </div>
//   );
// };
//
// // Sub-component to handle payment input & confirmation
// interface PaymentFormProps {
//   checkoutSession: CheckoutSession;
// }
//
// const PaymentForm: React.FC<PaymentFormProps> = ({ checkoutSession }) => {
//   const stripe = useStripe();
//   const elements = useElements();
//   const navigate = useNavigate();
//
//   const handleConfirmPayment = async () => {
//     if (!stripe || !elements) {
//       alert('Stripe has not loaded yet.');
//       return;
//     }
//
//     try {
//       // 4) Confirm the card payment with the client secret
//       const result = await stripe.confirmCardPayment(
//         checkoutSession.payment_secret || '',
//         {
//           payment_method: {
//             card: elements.getElement(CardElement)!,
//           },
//         }
//       );
//
//       if (result.error) {
//         console.error(result.error);
//         alert(result.error.message);
//         return;
//       }
//
//       if (result.paymentIntent?.status === 'succeeded') {
//         // 5) Payment succeeded on Stripe side -> finalize on backend
//         await api.post(`/checkout/complete/${checkoutSession.uuid}/`);
//         alert('Checkout completed successfully!');
//         // Possibly navigate to an order confirmation page
//         navigate('/');
//       } else {
//         alert('Payment did not succeed. Please try again.');
//       }
//     } catch (err) {
//       console.error(err);
//       alert('Error confirming payment.');
//     }
//   };
//
//   return (
//     <div className="mt-4">
//       <h4>Enter Payment Details</h4>
//       <div className="mb-3 border p-3 rounded">
//         <CardElement />
//       </div>
//       <button className="btn btn-success" onClick={handleConfirmPayment}>
//         Pay Now
//       </button>
//     </div>
//   );
// };
//
// export default CheckoutPage;
