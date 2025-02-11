import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { Cart, CartItem } from '../api/types';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useCartContext } from '../context/CartContext';

const CartPage: React.FC = () => {
  const { user } = useContext(AuthContext);

  // 1) Access the global cart count and setter from context
  const { cartCount, setCartCount } = useCartContext();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      setLoading(false);
      // 2) User is not logged in => no items in the cart
      setCartCount(0);
      return;
    }
    try {
      const response = await api.get('/cart/');
      setCart(response.data);
      // 3) update the global cart count
      setCartCount(response.data.items.length);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch cart.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Update cart item quantity
  const handleUpdateQuantity = async (item: CartItem, newQty: number) => {
    try {
      await api.patch(`/cart/update/${item.uuid}/`, { quantity: newQty });
      await fetchCart();
    } catch (err) {
      console.error(err);
      alert('Failed to update item quantity.');
    }
  };

  // Remove one cart item
  const handleRemoveItem = async (item: CartItem) => {
    try {
      await api.delete(`/cart/remove/${item.uuid}/`);
      await fetchCart();
    } catch (err) {
      console.error(err);
      alert('Failed to remove item from cart.');
    }
  };

  // Clear entire cart
  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) {
      return;
    }
    try {
      await api.delete('/cart/clear/');
      await fetchCart();
    } catch (err) {
      console.error(err);
      alert('Failed to clear cart.');
    }
  };

  if (!user) {
    return (
      <div className="container mt-5">
        <p>Please <Link to="/login">log in</Link> to view your cart.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading cart...</span>
        </div>
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

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mt-5">
        <h2>Your Cart is Empty</h2>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2>Your Cart</h2>
      <ul className="list-group">
        {cart.items.map((item) => (
          <li key={item.uuid} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{item.product.name}</strong> <br />
              Price: $
              {item.product.price
                ? parseFloat(item.product.price.toString()).toFixed(2)
                : 'N/A'} <br />
              <small className="text-muted">UUID: {item.uuid}</small>
            </div>
            <div>
              <div className="d-flex align-items-center">
                <label className="me-2 mb-0">Qty:</label>
                <input
                  type="number"
                  className="form-control me-2"
                  style={{ width: '60px' }}
                  value={item.quantity}
                  onChange={(e) => handleUpdateQuantity(item, Number(e.target.value))}
                  min={1}
                />
                <button className="btn btn-danger" onClick={() => handleRemoveItem(item)}>
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 d-flex justify-content-between">
        <button className="btn btn-secondary" onClick={handleClearCart}>
          Clear Cart
        </button>
        <Link to="/checkout" className="btn btn-primary">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default CartPage;
