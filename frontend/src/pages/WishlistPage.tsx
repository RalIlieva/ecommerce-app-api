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

// 1) Import your wishlist context
import { useWishlistContext } from '../context/WishlistContext';

const WishlistPage: React.FC = () => {
  // 2) Access current user from AuthContext
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // 3) Access the global wishlist count and setter from context
  const { wishlistCount, setWishlistCount } = useWishlistContext();

  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch wishlist on mount if user is logged in
  useEffect(() => {
    const loadWishlist = async () => {
      if (!user) {
        setLoading(false);
        // user not logged in => reset local wishlist & global count
        setWishlist(null);
        setWishlistCount(0);
        return;
      }
      try {
        setLoading(true);
        const data = await fetchWishlist();
        setWishlist(data);
        // 4) Update global wishlist count
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

  // 2) Handler to remove an item
  const handleRemove = async (item: WishlistItem) => {
    if (!user) {
      alert('Please log in to manage your wishlist.');
      return;
    }
    try {
      await removeFromWishlist(item.product.uuid);
      // Re-fetch the wishlist
      const updated = await fetchWishlist();
      setWishlist(updated);
      // 4) Update global wishlist count
      setWishlistCount(updated.items.length);
    } catch (err) {
      console.error(err);
      alert('Failed to remove from wishlist.');
    }
  };

  // 3) Handler to move item to cart
  const handleMoveToCart = async (item: WishlistItem) => {
    if (!user) {
      alert('Please log in to manage your wishlist.');
      return;
    }
    try {
      await moveWishlistItemToCart(item.product.uuid);
      alert('Item moved to cart!');
      // Re-fetch the wishlist
      const updated = await fetchWishlist();
      setWishlist(updated);
      // Update global wishlist count
      setWishlistCount(updated.items.length);
      // Optionally navigate("/cart") if you want the user to go to the cart
    } catch (err) {
      console.error(err);
      alert('Failed to move item to cart.');
    }
  };

  // Basic states
  if (!user) {
    return (
      <div className="container mt-5">
        <p>Please log in to view your wishlist.</p>
      </div>
    );
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
    return (
      <div className="container mt-5 text-center">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <h3>Your wishlist is empty</h3>
      </div>
    );
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
                <p className="card-text text-muted">
                  {item.product.description?.substring(0, 80)}...
                </p>
                <p className="text-primary">
                  $
                  {item.product.price
                    ? parseFloat(item.product.price.toString()).toFixed(2)
                    : 'N/A'}
                </p>

                {/* Stock status */}
                <p>
                  {item.in_stock ? (
                    <span className="text-success">
                      In Stock: {item.product.stock ?? 0}
                    </span>
                  ) : (
                    <span className="text-danger">
                      Out of Stock
                    </span>
                  )}
                </p>

                {/* Remove button */}
                <button
                  className="btn btn-outline-danger me-2"
                  onClick={() => handleRemove(item)}
                >
                  Remove
                </button>
                {/* Move to cart button */}
                <button
                  className="btn btn-success"
                  onClick={() => handleMoveToCart(item)}
                >
                  Move to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;



// // src/pages/WishlistPage.tsx
// import React, { useEffect, useState, useContext } from 'react';
// import AuthContext from '../context/AuthContext';
// import {
//   fetchWishlist,
//   removeFromWishlist,
//   moveWishlistItemToCart,
//   Wishlist,
//   WishlistItem
// } from '../api/wishlist';
// import { useNavigate } from 'react-router-dom';
//
// const WishlistPage: React.FC = () => {
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();
//
//   const [wishlist, setWishlist] = useState<Wishlist | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//
//   // 1) Fetch wishlist on mount if user is logged in
//   useEffect(() => {
//     const loadWishlist = async () => {
//       if (!user) {
//         setLoading(false);
//         return;
//       }
//       try {
//         setLoading(true);
//         const data = await fetchWishlist();
//         setWishlist(data);
//       } catch (err) {
//         console.error(err);
//         setError('Failed to fetch wishlist.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadWishlist();
//   }, [user]);
//
//   // 2) Handler to remove an item
//   const handleRemove = async (item: WishlistItem) => {
//     if (!user) {
//       alert('Please log in to manage your wishlist.');
//       return;
//     }
//     try {
//       await removeFromWishlist(item.product.uuid);
//       // Re-fetch the wishlist
//       if (wishlist) {
//         const updated = await fetchWishlist();
//         setWishlist(updated);
//       }
//     } catch (err) {
//       console.error(err);
//       alert('Failed to remove from wishlist.');
//     }
//   };
//
//   // 3) Handler to move item to cart
//   const handleMoveToCart = async (item: WishlistItem) => {
//     if (!user) {
//       alert('Please log in to manage your wishlist.');
//       return;
//     }
//     try {
//       await moveWishlistItemToCart(item.product.uuid);
//       // Usually you might want to redirect to cart or re-fetch wishlist
//       alert('Item moved to cart!');
//       if (wishlist) {
//         const updated = await fetchWishlist();
//         setWishlist(updated);
//       }
//     } catch (err) {
//       console.error(err);
//       alert('Failed to move item to cart.');
//     }
//   };
//
//   // Basic states
//   if (!user) {
//     return (
//       <div className="container mt-5">
//         <p>Please log in to view your wishlist.</p>
//       </div>
//     );
//   }
//
//   if (loading) {
//     return (
//       <div className="container mt-5 text-center">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading wishlist...</span>
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
//   if (!wishlist || wishlist.items.length === 0) {
//     return (
//       <div className="container mt-5 text-center">
//         <h3>Your wishlist is empty</h3>
//       </div>
//     );
//   }
//
//   return (
//     <div className="container mt-5">
//       <h2>Your Wishlist</h2>
//       <div className="row">
//         {wishlist.items.map((item) => (
//           <div className="col-md-4 mb-4" key={item.uuid}>
//             <div className="card">
//               <img
//                 src={item.product.image || '/placeholder.png'}
//                 className="card-img-top"
//                 alt={item.product.name}
//                 style={{ maxHeight: '200px', objectFit: 'cover' }}
//               />
//               <div className="card-body">
//                 <h5 className="card-title">{item.product.name}</h5>
//                 <p className="card-text text-muted">
//                   {item.product.description?.substring(0, 80)}...
//                 </p>
//                 <p className="text-primary">
//                   ${item.product.price ? parseFloat(item.product.price.toString()).toFixed(2) : 'N/A'}
//                 </p>
//
//                 {/* Stock status */}
//               <p>
//                 {item.in_stock ? (
//                     <span className="text-success">
//                         In Stock: {item.product.stock ?? 0}
//                     </span>
//                 ) : (
//                     <span className="text-danger">
//                         Out of Stock
//                     </span>
//                     )}
//                 </p>
//
//                 {/* Remove button */}
//                 <button
//                   className="btn btn-outline-danger me-2"
//                   onClick={() => handleRemove(item)}
//                 >
//                   Remove
//                 </button>
//                 {/* Move to cart button */}
//                 <button
//                   className="btn btn-success"
//                   onClick={() => handleMoveToCart(item)}
//                 >
//                   Move to Cart
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };
//
// export default WishlistPage;
