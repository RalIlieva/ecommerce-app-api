// src/components/ProductDetail.tsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { ProductDetail as ProductDetailType } from '../api/types';
import AuthContext from '../context/AuthContext';
import ProductReviews from './ProductReviews';
import { renderStars } from '../utils';
import ImageGallery from '../components/ImageGallery';
import { addToWishlist } from '../api/wishlist';

const ProductDetail: React.FC = () => {
  const { uuid, slug } = useParams<{ uuid: string; slug: string }>();
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch product details on mount
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await api.get(`/products/products/${uuid}/${slug}/`);
        setProduct(response.data);
      } catch (err) {
        setError('Failed to fetch product details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (uuid && slug) {
      fetchProductDetail();
    }
  }, [uuid, slug]);

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please log in to add to cart.');
      return;
    }

    try {
      const quantityInput = (document.getElementById('quantity') as HTMLInputElement).value;
      const quantity = quantityInput ? Number(quantityInput) : 1;

      await api.post('/cart/add/', {
        product_uuid: product?.uuid,
        quantity,
      });

      alert('Item added to cart!');
    } catch (err) {
      console.error(err);
      alert('Failed to add item to cart.');
    }
  };

  // Add to Wishlist functionality
  const handleAddToWishlist = async () => {
    if (!user) {
      alert('Please log in to add to wishlist.');
      return;
    }

    try {
      if (!product) return;
      await addToWishlist(product.uuid); // API call for adding to wishlist
      alert('Item added to wishlist!');
    } catch (err) {
      console.error(err);
      alert('Failed to add item to wishlist.');
    }
  };

  if (loading) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
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

  if (!product) {
    return (
      <div className="container text-center mt-5">
        <p>Product not found.</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row gx-lg-5">
        {/* Product Image and Gallery */}
        <div className="col-md-6 mb-4">
          <ImageGallery images={product.images} mainHeight="500px" />
        </div>

        {/* Product Details */}
        <div className="col-md-6">
          <h1 className="fw-bold">{product.name}</h1>
          {/* Average rating */}
          {product.average_rating !== null && product.average_rating !== undefined && (
            <div className="mb-2">
              {renderStars(product.average_rating)}
              <span className="ms-2">{product.average_rating.toFixed(1)}/5</span>
            </div>
          )}
          <p className="text-muted">{product.description}</p>
          <p
            className={`text-muted ${
              product.stock > 0 ? 'text-success' : 'text-danger'
            }`}
          >
            {product.stock > 0 ? `In stock: ${product.stock}` : 'Out of stock'}
          </p>
          <h5 className="text-primary">
            ${product.price ? parseFloat(product.price.toString()).toFixed(2) : 'N/A'}
          </h5>
          <div className="mt-4">
            <label htmlFor="quantity" className="form-label">
              Quantity:
            </label>
            <input
              type="number"
              id="quantity"
              className="form-control w-25 mb-3"
              defaultValue={1}
              min={1}
            />
            {/* Updated Add to Cart button */}
            <button className="btn btn-primary me-2" onClick={handleAddToCart}>
              Add to Cart
            </button>
            {/* Add to Wishlist button */}
            <button className="btn btn-outline-danger" onClick={handleAddToWishlist}>
              <i className="fas fa-heart"></i> Add to Wishlist
            </button>
          </div>
        </div>
      </div>

      {/* Render the unified reviews component */}
      <ProductReviews
        productUuid={product.uuid}
        productSlug={product.slug}
        isAuthenticated={!!user}
      />
    </div>
  );
};

export default ProductDetail;


// // src/components/ProductDetail.tsx
// import React, { useEffect, useState, useContext } from 'react';
// import { useParams } from 'react-router-dom';
// import api from '../api';
// import { ProductDetail as ProductDetailType } from '../api/types';
// import AuthContext from '../context/AuthContext';
// import ProductReviews from './ProductReviews';
// import { renderStars } from '../utils';
// import ImageGallery from '../components/ImageGallery';
// import { addToWishlist } from '../api/wishlist';
//
//
// const ProductDetail: React.FC = () => {
//   const { uuid, slug } = useParams<{ uuid: string; slug: string }>();
//   const { user } = useContext(AuthContext);
//
//   const [product, setProduct] = useState<ProductDetailType | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//
//   // Fetch product details on mount
//   useEffect(() => {
//     const fetchProductDetail = async () => {
//       try {
//         const response = await api.get(`/products/products/${uuid}/${slug}/`);
//         setProduct(response.data);
//       } catch (err) {
//         setError('Failed to fetch product details.');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//
//     if (uuid && slug) {
//       fetchProductDetail();
//     }
//   }, [uuid, slug]);
//
//   const handleAddToCart = async () => {
//     if (!user) {
//       alert('Please log in to add to cart.');
//       return;
//     }
//
//     try {
//       // Get the quantity input
//       const quantityInput = (document.getElementById('quantity') as HTMLInputElement).value;
//       const quantity = quantityInput ? Number(quantityInput) : 1;
//
//       await api.post('/cart/add/', {
//         product_uuid: product?.uuid, // Access product UUID
//         quantity,
//       });
//
//       alert('Item added to cart!');
//     } catch (err) {
//       console.error(err);
//       alert('Failed to add item to cart.');
//     }
//   };
//
//   if (loading) {
//     return (
//       <div className="container text-center mt-5">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
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
//   if (!product) {
//     return (
//       <div className="container text-center mt-5">
//         <p>Product not found.</p>
//       </div>
//     );
//   }
//
//   return (
//     <div className="container mt-5">
//       <div className="row gx-lg-5">
//         {/* Product Image and Gallery */}
//         <div className="col-md-6 mb-4">
//           <ImageGallery images={product.images} mainHeight="500px" />
//         </div>
//
//         {/* Product Details */}
//         <div className="col-md-6">
//           <h1 className="fw-bold">{product.name}</h1>
//           {/* Average rating */}
//           {product.average_rating !== null && product.average_rating !== undefined && (
//             <div className="mb-2">
//               {renderStars(product.average_rating)}
//               <span className="ms-2">{product.average_rating.toFixed(1)}/5</span>
//             </div>
//           )}
//           <p className="text-muted">{product.description}</p>
//           <p
//             className={`text-muted ${
//               product.stock > 0 ? 'text-success' : 'text-danger'
//             }`}
//           >
//             {product.stock > 0 ? `In stock: ${product.stock}` : 'Out of stock'}
//           </p>
//           <h5 className="text-primary">
//             ${product.price ? parseFloat(product.price.toString()).toFixed(2) : 'N/A'}
//           </h5>
//           <div className="mt-4">
//             <label htmlFor="quantity" className="form-label">
//               Quantity:
//             </label>
//             <input
//               type="number"
//               id="quantity"
//               className="form-control w-25 mb-3"
//               defaultValue={1}
//               min={1}
//             />
//             {/* Updated Add to Cart button */}
//             <button className="btn btn-primary me-2" onClick={handleAddToCart}>
//               Add to Cart
//             </button>
//             <button className="btn btn-outline-danger">
//               <i className="fas fa-heart"></i> Add to Wishlist
//             </button>
//           </div>
//         </div>
//       </div>
//
//       {/* Render the unified reviews component */}
//       <ProductReviews
//         productUuid={product.uuid}
//         productSlug={product.slug}
//         isAuthenticated={!!user}
//       />
//     </div>
//   );
// };
//
// export default ProductDetail;



// // src/components/ProductDetail.tsx
// import React, { useEffect, useState, useContext } from 'react';
// import { useParams } from 'react-router-dom';
// import api from '../api';
// import { ProductDetail as ProductDetailType } from '../api/types';
// import AuthContext from '../context/AuthContext';
// import ProductReviews from './ProductReviews';
// import { renderStars } from '../utils';
// import ImageGallery from '../components/ImageGallery';
//
// const ProductDetail: React.FC = () => {
//   const { uuid, slug } = useParams<{ uuid: string; slug: string }>();
//   const { user } = useContext(AuthContext);
//
//   const [product, setProduct] = useState<ProductDetailType | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//
//   // Fetch product details on mount
//   useEffect(() => {
//     const fetchProductDetail = async () => {
//       try {
//         const response = await api.get(`/products/products/${uuid}/${slug}/`);
//         setProduct(response.data);
//       } catch (err) {
//         setError('Failed to fetch product details.');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//
//     if (uuid && slug) {
//       fetchProductDetail();
//     }
//   }, [uuid, slug]);
//
//   if (loading) {
//     return (
//       <div className="container text-center mt-5">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
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
//   if (!product) {
//     return (
//       <div className="container text-center mt-5">
//         <p>Product not found.</p>
//       </div>
//     );
//   }
//
//   return (
//     <div className="container mt-5">
//       <div className="row gx-lg-5">
//
//         {/* Product Image and Gallery */}
//             <div className="col-md-6 mb-4">
//                 <ImageGallery images={product.images} mainHeight="500px" />
//             </div>
//
//
//         {/* Product Details */}
//         <div className="col-md-6">
//           <h1 className="fw-bold">{product.name}</h1>
//           {/* Average rating */}
//           {product.average_rating !== null && product.average_rating !== undefined && (
//             <div className="mb-2">
//                 {renderStars(product.average_rating)}
//                 <span className="ms-2">
//                     {product.average_rating.toFixed(1)}/5
//                 </span>
//             </div>
//            )}
//           <p className="text-muted">{product.description}</p>
//           <p className={`text-muted ${product.stock > 0 ? 'text-success' : 'text-danger'}`}>
//             {product.stock > 0 ? `In stock: ${product.stock}` : 'Out of stock'}
//           </p>
//           <h5 className="text-primary">
//             ${product.price ? parseFloat(product.price.toString()).toFixed(2) : 'N/A'}
//           </h5>
//           <div className="mt-4">
//             <label htmlFor="quantity" className="form-label">
//               Quantity:
//             </label>
//             <input
//               type="number"
//               id="quantity"
//               className="form-control w-25 mb-3"
//               defaultValue={1}
//               min={1}
//             />
//             <button className="btn btn-primary me-2">Add to Cart</button>
//             <button className="btn btn-outline-danger">
//               <i className="fas fa-heart"></i> Add to Wishlist
//             </button>
//           </div>
//         </div>
//       </div>
//
//
//       {/* Render the unified reviews component */}
//       <ProductReviews
//         productUuid={product.uuid}
//         productSlug={product.slug}
//         isAuthenticated={!!user}
//       />
//     </div>
//   );
// };
//
// export default ProductDetail;

