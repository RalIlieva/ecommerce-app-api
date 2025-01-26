// src/pages/CheckoutPage.tsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api';
import { Cart } from '../api/types';  // or define a similar interface
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_12345');
// ^ Replace with your real Stripe publishable key

interface CheckoutSession {
  uuid: string;
  shipping_address: string;
  payment_secret: string;
  status: string; // 'IN_PROGRESS', etc.
  // ...
}

const CheckoutPage: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loadingCart, setLoadingCart] = useState(true);

  const [shippingAddress, setShippingAddress] = useState('');
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(null);

  useEffect(() => {
    // 1) Fetch the user's cart if logged in
    const fetchCart = async () => {
      if (!user) {
        setLoadingCart(false);
        return;
      }
      try {
        const response = await api.get('/cart/');
        setCart(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCart(false);
      }
    };
    fetchCart();
  }, [user]);

  const handleStartCheckout = async () => {
    try {
      if (!shippingAddress.trim()) {
        alert('Please enter a shipping address.');
        return;
      }
      // 2) Call /checkout/start/ with shipping_address
      const response = await api.post('/checkout/start/', {
        shipping_address: shippingAddress
      });
      setCheckoutSession(response.data);
      // We get back { uuid, payment_secret, status, etc. }
    } catch (err) {
      console.error(err);
      alert('Failed to start checkout session.');
    }
  };

  if (!user) {
    return (
      <div className="container mt-5">
        <p>Please log in to check out.</p>
      </div>
    );
  }

  if (loadingCart) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading cart...</span>
        </div>
      </div>
    );
  }

  if (cart && cart.items.length === 0) {
    return (
      <div className="container mt-5">
        <h4>Your cart is empty!</h4>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2>Checkout</h2>

      {!checkoutSession ? (
        <div>
          <h4>Shipping Address</h4>
          <textarea
            className="form-control mb-3"
            rows={2}
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
          ></textarea>

          {/* We could show a cart summary here */}
          <ul className="list-group mb-3">
            {cart?.items.map((item) => (
              <li key={item.uuid} className="list-group-item d-flex">
                <div>
                  {item.product.name} (x {item.quantity})
                </div>
                <div className="ms-auto">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>

          <button className="btn btn-primary" onClick={handleStartCheckout}>
            Proceed to Payment
          </button>
        </div>
      ) : (
        // Once we have a checkoutSession with payment_secret, show the Stripe form
        <Elements stripe={stripePromise} options={{ clientSecret: checkoutSession.payment_secret }}>
          <PaymentForm checkoutSession={checkoutSession} />
        </Elements>
      )}
    </div>
  );
};

// A sub-component that handles the Stripe card input & confirm
interface PaymentFormProps {
  checkoutSession: CheckoutSession;
}
const PaymentForm: React.FC<PaymentFormProps> = ({ checkoutSession }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const handleConfirmPayment = async () => {
    if (!stripe || !elements) {
      alert('Stripe has not loaded yet.');
      return;
    }

    try {
      // 3) Confirm the card payment using the PaymentIntent client secret
      const result = await stripe.confirmCardPayment(checkoutSession.payment_secret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        // Payment or validation failed
        console.error(result.error);
        alert(result.error.message);
        return;
      }

      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // 4) The payment is successful on Stripe's side
        // Now call /checkout/complete/<checkoutSession.uuid> on the backend
        await api.post(`/checkout/complete/${checkoutSession.uuid}/`);
        alert('Payment and checkout completed!');
        navigate('/'); // or navigate to an Order Confirmation page
      } else {
        alert('Payment did not succeed. Please try again.');
      }
    } catch (err) {
      console.error(err);
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
