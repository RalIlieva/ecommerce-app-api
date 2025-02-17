// src/pages/WishlistPage.tsx
import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import {
  fetchWishlist,
  removeFromWishlist,
  moveWishlistItemToCart,
  Wishlist,
  WishlistItem
} from '../api/wishlist';
import { useNavigate } from 'react-router-dom';
import { useWishlistContext } from '../context/WishlistContext';
import { useCartContext } from '../context/CartContext';
import api from '../api';

const WishlistPage: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { wishlistCount, setWishlistCount } = useWishlistContext();
  const { cartCount, setCartCount } = useCartContext(); // Access CartContext

  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWishlist = async () => {
      if (!user) {
        setLoading(false);
        setWishlist(null);
        setWishlistCount(0);
        return;
      }
      try {
        setLoading(true);
        const data = await fetchWishlist();
        setWishlist(data);
        setWishlistCount(data.items.length);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch wishlist.');
      } finally {
        setLoading(false);
      }
    };
    loadWishlist();
  }, [user, setWishlistCount]);

  const handleMoveToCart = async (item: WishlistItem) => {
    if (!user) {
      alert('Please log in to manage your wishlist.');
      return;
    }
    try {
      await moveWishlistItemToCart(item.product.uuid);
      alert('Item moved to cart!');

      // Fetch updated wishlist
      const updatedWishlist = await fetchWishlist();
      setWishlist(updatedWishlist);
      setWishlistCount(updatedWishlist.items.length);

      // Fetch updated cart count
      const response = await api.get('/cart/');
      setCartCount(response.data.items.length); // Update cart badge count

    } catch (err) {
      console.error(err);
      alert('Failed to move item to cart.');
    }
  };

  if (!user) {
    return <div className="container mt-5"><p>Please log in to view your wishlist.</p></div>;
  }

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading wishlist...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="container mt-5 text-center"><p className="text-danger">{error}</p></div>;
  }

  if (!wishlist || wishlist.items.length === 0) {
    return <div className="container mt-5 text-center"><h3>Your wishlist is empty</h3></div>;
  }

  return (
    <div className="container mt-5">
      <h2>Your Wishlist</h2>
      <div className="row">
        {wishlist.items.map((item) => (
          <div className="col-md-4 mb-4" key={item.uuid}>
            <div className="card">
              <img
                src={item.product.image || '/placeholder.png'}
                className="card-img-top"
                alt={item.product.name}
                style={{ maxHeight: '200px', objectFit: 'cover' }}
              />
              <div className="card-body">
                <h5 className="card-title">{item.product.name}</h5>
                <button className="btn btn-outline-danger me-2" onClick={() => handleRemove(item)}>Remove</button>
                <button className="btn btn-success" onClick={() => handleMoveToCart(item)}>Move to Cart</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
