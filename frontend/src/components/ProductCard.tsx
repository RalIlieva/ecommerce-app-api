// src/components/ProductCard.tsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../api/types';
import { renderStars } from '../utils';
import AuthContext from '../context/AuthContext';
import api from '../api';
import { addToWishlist } from '../api/wishlist';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { user } = useContext(AuthContext);

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please log in to add to cart.');
      return;
    }
    try {
      await api.post('/cart/add/', {
        product_uuid: product.uuid,
        quantity: 1, // default to 1 for quick add
      });
      alert('Item added to cart!');
    } catch (err) {
      console.error(err);
      alert('Failed to add item to cart.');
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      alert('Please log in to add to wishlist.');
      return;
    }

    try {
      await addToWishlist(product.uuid); // Call wishlist API helper
      alert('Item added to wishlist!');
    } catch (err) {
      console.error(err);
      alert('Failed to add item to wishlist.');
    }
  };

  return (
    <div className="card h-100">
      {/* Top image/thumbnail area */}
      <div className="card-img-top overflow-hidden" style={{ height: '200px' }}>
        <Link to={`/products/products/${product.uuid}/${product.slug}`}>
          <img
            src={product.image || 'https://via.placeholder.com/300'}
            className="img-fluid"
            alt={product.name}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </Link>
      </div>

      {/* Body content */}
      <div className="card-body">
        <h5 className="card-title">
          <Link
            to={`/products/products/${product.uuid}/${product.slug}`}
            className="text-decoration-none text-dark"
          >
            {product.name}
          </Link>
        </h5>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <p className="card-text">
            Tags:{' '}
            {product.tags.map((tag) => (
              <span key={tag.uuid} className="badge bg-secondary me-1">
                {tag.name}
              </span>
            ))}
          </p>
        )}

        {/* Price */}
        <h6 className="card-text text-primary">
          ${product.price ? parseFloat(product.price.toString()).toFixed(2) : 'N/A'}
        </h6>

        {/* Average rating (stars + numeric) */}
        {product.average_rating !== null &&
          product.average_rating !== undefined && (
            <div className="my-2">
              {renderStars(product.average_rating)}
              <span className="ms-2">
                {product.average_rating.toFixed(1)}/5
              </span>
            </div>
          )}
      </div>

      {/* Footer with action buttons */}
      <div className="card-footer bg-transparent">
        <div className="d-flex justify-content-between">
          <button className="btn btn-primary" onClick={handleAddToCart}>
            Add to Cart
          </button>
          <button className="btn btn-outline-danger" onClick={handleAddToWishlist}>
            <i className="fas fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;



// // src/components/ProductCard.tsx
// import React, { useContext } from 'react';
// import { Link } from 'react-router-dom';
// import { Product } from '../api/types';
// import { renderStars } from '../utils';
// import AuthContext from '../context/AuthContext';
// import api from '../api';
//
// interface ProductCardProps {
//   product: Product;
// }
//
// const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
//   const { user } = useContext(AuthContext);
//
//   const handleAddToCart = async () => {
//     if (!user) {
//       alert('Please log in to add to cart.');
//       return;
//     }
//     try {
//       await api.post('/cart/add/', {
//         product_uuid: product.uuid,
//         quantity: 1, // default to 1 for quick add
//       });
//       alert('Item added to cart!');
//     } catch (err) {
//       console.error(err);
//       alert('Failed to add item to cart.');
//     }
//   };
//
//   return (
//     <div className="card h-100">
//       {/* Top image/thumbnail area */}
//       <div className="card-img-top overflow-hidden" style={{ height: '200px' }}>
//         <Link to={`/products/products/${product.uuid}/${product.slug}`}>
//           <img
//             src={product.image || 'https://via.placeholder.com/300'}
//             className="img-fluid"
//             alt={product.name}
//             style={{ objectFit: 'cover', width: '100%', height: '100%' }}
//           />
//         </Link>
//       </div>
//
//       {/* Body content */}
//       <div className="card-body">
//         <h5 className="card-title">
//           <Link
//             to={`/products/products/${product.uuid}/${product.slug}`}
//             className="text-decoration-none text-dark"
//           >
//             {product.name}
//           </Link>
//         </h5>
//
//         {/* Tags */}
//         {product.tags && product.tags.length > 0 && (
//           <p className="card-text">
//             Tags:{' '}
//             {product.tags.map((tag) => (
//               <span key={tag.uuid} className="badge bg-secondary me-1">
//                 {tag.name}
//               </span>
//             ))}
//           </p>
//         )}
//
//         {/* Price */}
//         <h6 className="card-text text-primary">
//           ${product.price ? parseFloat(product.price.toString()).toFixed(2) : 'N/A'}
//         </h6>
//
//         {/* Average rating (stars + numeric) */}
//         {product.average_rating !== null &&
//           product.average_rating !== undefined && (
//             <div className="my-2">
//               {renderStars(product.average_rating)}
//               <span className="ms-2">
//                 {product.average_rating.toFixed(1)}/5
//               </span>
//             </div>
//           )}
//       </div>
//
//       {/* Footer with action buttons */}
//       <div className="card-footer bg-transparent">
//         <div className="d-flex justify-content-between">
//           <button className="btn btn-primary" onClick={handleAddToCart}>
//             Add to Cart
//           </button>
//           <button className="btn btn-outline-danger">
//             <i className="fas fa-heart"></i>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
//
// export default ProductCard;
