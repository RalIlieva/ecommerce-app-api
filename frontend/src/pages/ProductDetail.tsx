// src/components/ProductDetail.tsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { ProductDetail as ProductDetailType } from '../types';
import AuthContext from '../context/AuthContext';
import ProductReviews from './ProductReviews';

const ProductDetail: React.FC = () => {
  const { uuid, slug } = useParams<{ uuid: string; slug: string }>();
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lightbox state
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);

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

  // Lightbox handlers
  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowLightbox(true);
  };
  const closeLightbox = () => setShowLightbox(false);
  const navigateToNextImage = () => {
    if (product && selectedImageIndex !== null) {
      const nextIndex = (selectedImageIndex + 1) % product.images.length;
      setSelectedImageIndex(nextIndex);
    }
  };
  const navigateToPreviousImage = () => {
    if (product && selectedImageIndex !== null) {
      const prevIndex = (selectedImageIndex - 1 + product.images.length) % product.images.length;
      setSelectedImageIndex(prevIndex);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row gx-lg-5">
        {/* Product Image and Gallery */}
        <div className="col-md-6 mb-4">
          <img
            src={
              product.images.length > 0
                ? product.images[0].image_url
                : 'https://via.placeholder.com/500'
            }
            alt={product.name}
            className="img-fluid rounded mb-4"
            style={{ maxHeight: '500px', objectFit: 'cover' }}
          />

          {/* Gallery Thumbnails */}
          <div className="d-flex flex-wrap">
            {product.images.map((image, index) => (
              <img
                key={image.id}
                src={image.image_url}
                alt={image.alt_text || `Gallery ${image.id}`}
                className="img-thumbnail me-2 mb-2"
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                onClick={() => handleThumbnailClick(index)}
              />
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="col-md-6">
          <h1 className="fw-bold">{product.name}</h1>
          <p className="text-muted">{product.description}</p>
          <p className={`text-muted ${product.stock > 0 ? 'text-success' : 'text-danger'}`}>
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
            <button className="btn btn-primary me-2">Add to Cart</button>
            <button className="btn btn-outline-danger">
              <i className="fas fa-heart"></i> Add to Wishlist
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Enlarged Image */}
      {showLightbox && selectedImageIndex !== null && (
        <div className="lightbox-modal" style={{ display: 'flex' }}>
          <div className="lightbox-overlay" onClick={closeLightbox}></div>
          <div className="lightbox-content">
            <img
              src={product.images[selectedImageIndex].image_url}
              alt="Enlarged view"
              className="img-fluid rounded"
              style={{ maxHeight: '80vh', objectFit: 'contain' }}
            />
            <div className="lightbox-navigation">
              <button className="btn btn-light" onClick={navigateToPreviousImage}>
                <i className="fas fa-chevron-left"></i>
              </button>
              <button className="btn btn-light" onClick={navigateToNextImage}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            <button className="close-btn" onClick={closeLightbox}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

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


// import React, { useEffect, useState,useContext } from 'react';
// import { useParams } from 'react-router-dom';
// import AuthContext from '../context/AuthContext';
// import api from '../api';
// import ProductReviews from './ProductReviews';
//
// interface ProductImage {
//   id: number;
//   image: string; // Absolute URL
//   alt_text: string;
//   image_url: string; // Absolute URL
// }
//
// interface Review {
//   id: string;
//   uuid: string;
//   user: {
//     name: string; // Adjust based on UserReviewSerializer
//   };
//   rating: number;
//   comment: string;
//   created: string;
// }
//
// interface ProductDetail {
//   uuid: string;
//   name: string;
//   slug: string;
//   description: string;
//   price: number;
//   image: string; // Absolute URL
//   stock: number;
//   images: ProductImage[]; // Related images
//   reviews: any[]; // Adjust based on actual review serializer
//   average_rating: number;
//   category: any; // Adjust based on actual category serializer
//   tags: any[]; // Adjust based on actual tag serializer
// }
//
// const ProductDetail: React.FC = () => {
//   const { uuid, slug } = useParams<{ uuid: string; slug: string }>();
//   const { user } = useContext(AuthContext); // To check if the user is authenticated
//   const [product, setProduct] = useState<ProductDetail | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
//   const [showLightbox, setShowLightbox] = useState(false);
//
//   const [reviews, setReviews] = useState<Review[]>([]);
//   const [newReview, setNewReview] = useState<{ rating: number; comment: string }>({
//     rating: 5,
//     comment: '',
//   });
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//
//   // Set initial selected image index (if you want to select the first image)
//   const handleThumbnailClick = (index: number) => {
//     setSelectedImageIndex(index);
//     setShowLightbox(true); // Open lightbox when a thumbnail is clicked
//   };
//
//   const toggleLightbox = () => {
//     setShowLightbox(!showLightbox);
//   };
//
//   const closeLightbox = () => {
//     setShowLightbox(false);
//   };
//
//   const navigateToNextImage = () => {
//     if (product && selectedImageIndex !== null) {
//       const nextIndex = (selectedImageIndex + 1) % product.images.length;
//       setSelectedImageIndex(nextIndex);
//     }
//   };
//
//   const navigateToPreviousImage = () => {
//     if (product && selectedImageIndex !== null) {
//       const prevIndex = (selectedImageIndex - 1 + product.images.length) % product.images.length;
//       setSelectedImageIndex(prevIndex);
//     }
//   };
//
//   useEffect(() => {
//     const fetchProductDetail = async () => {
//       try {
//         const response = await api.get(`/products/products/${uuid}/${slug}/`);
//         setProduct(response.data);
//
//         const reviewsResponse = await api.get(
//           `/products/products/${uuid}/${slug}/reviews/`
//         );
//         setReviews(reviewsResponse.data.results || []); // Assuming paginated results
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
//   const handleReviewSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//
//     if (!user) {
//       alert('You must be logged in to submit a review.');
//       return;
//     }
//
//     setIsSubmitting(true);
//     try {
//       const response = await api.post(
//         `/products/products/${uuid}/${slug}/reviews/create/`,
//         newReview
//       );
//       setReviews([response.data, ...reviews]); // Add the new review to the list
//       setNewReview({ rating: 5, comment: '' }); // Reset form
//
//       } catch (err: any) {
//   if (err.response?.status === 400) {
//     // This is likely the “already reviewed” scenario
//     // Show a friendlier message to the user
//     alert('You have already reviewed this product.');
//   } else {
//     // Otherwise, show a generic error
//     alert('Failed to submit review. Please try again.');
//   }
//   console.error(err); // Or remove this if you don't want it in console
// } finally {
//   setIsSubmitting(false);
// }
//
// //        } catch (err: any) {
// //          if (err.response?.status === 400 && err.response?.data?.detail?.non_field_errors?.includes('You have already reviewed this product.')) {
// //       // Gracefully handle the duplicate review error
// //       setError('You have already reviewed this product.');
// //     } else {
// //       setError('Failed to submit review.');
// //       console.error(err); // Keep this for debugging purposes if needed
// //     }
// //   }
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
//           <img
//             src={
//               product.image ||
//               (product.images && product.images.length > 0 ? product.images[0].image_url : 'https://via.placeholder.com/500')
//             }
//             alt={product.name || 'Product image'}
//             className="img-fluid rounded mb-4"
//             style={{ maxHeight: '500px', objectFit: 'cover' }}
//           />
//
//           {/* Gallery Thumbnails */}
//           <div className="d-flex flex-wrap">
//             {product.images &&
//               product.images.map((image, index) => (
//                 <img
//                   key={image.id}
//                   src={image.image_url} // Use absolute URL
//                   alt={image.alt_text || `Gallery ${image.id}`}
//                   className="img-thumbnail me-2 mb-2"
//                   style={{ width: '100px', height: '100px', objectFit: 'cover' }}
//                   onClick={() => handleThumbnailClick(index)} // Open clicked image in the gallery
//                 />
//               ))}
//           </div>
//         </div>
//
//         {/* Product Details */}
//         <div className="col-md-6">
//           <h1 className="fw-bold">{product.name}</h1>
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
//       {/* Lightbox Modal for Enlarged Image */}
//       {showLightbox && product.images && selectedImageIndex !== null && (
//         <div className="lightbox-modal" style={{ display: 'flex' }}>
//           <div className="lightbox-overlay" onClick={closeLightbox}></div>
//           <div className="lightbox-content">
//             <img
//               src={product.images[selectedImageIndex].image_url} // Display the selected image
//               alt="Enlarged view"
//               className="img-fluid rounded"
//               style={{ maxHeight: '80vh', objectFit: 'contain' }}
//             />
//             <div className="lightbox-navigation">
//               <button className="btn btn-light" onClick={navigateToPreviousImage}>
//                 <i className="fas fa-chevron-left"></i>
//               </button>
//               <button className="btn btn-light" onClick={navigateToNextImage}>
//                 <i className="fas fa-chevron-right"></i>
//               </button>
//             </div>
//             <button className="close-btn" onClick={closeLightbox}>
//               <i className="fas fa-times"></i>
//             </button>
//           </div>
//         </div>
//       )}
//
//       <div className="mt-5">
//         <h2>Customer Reviews</h2>
//         {reviews.length > 0 ? (
//           reviews.map((review) => (
//             <div key={review.uuid} className="border rounded p-3 mb-3">
//               <h5>{review.user.name}</h5>
//               <p className="mb-1">Rating: {review.rating} / 5</p>
//               <p>{review.comment}</p>
//               <p className="text-muted" style={{ fontSize: '0.9rem' }}>
//                 {new Date(review.created).toLocaleDateString()}
//               </p>
//             </div>
//           ))
//         ) : (
//           <p className="text-muted">No reviews yet. Be the first to review!</p>
//         )}
//
//         {user ? (
//           <form className="mt-4" onSubmit={handleReviewSubmit}>
//             <div className="mb-3">
//               <label htmlFor="rating" className="form-label">
//                 Rating
//               </label>
//               <select
//                 id="rating"
//                 className="form-select"
//                 value={newReview.rating}
//                 onChange={(e) =>
//                   setNewReview({ ...newReview, rating: Number(e.target.value) })
//                 }
//                 required
//               >
//                 {[1, 2, 3, 4, 5].map((rating) => (
//                   <option key={rating} value={rating}>
//                     {rating}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="mb-3">
//               <label htmlFor="comment" className="form-label">
//                 Comment
//               </label>
//               <textarea
//                 id="comment"
//                 className="form-control"
//                 rows={3}
//                 value={newReview.comment}
//                 onChange={(e) =>
//                   setNewReview({ ...newReview, comment: e.target.value })
//                 }
//                 required
//               ></textarea>
//             </div>
//             <button
//               type="submit"
//               className="btn btn-primary"
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? 'Submitting...' : 'Submit Review'}
//             </button>
//           </form>
//         ) : (
//           <p className="text-muted mt-3">
//             <a href="/login">Log in</a> to leave a review.
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };
//
// export default ProductDetail;
//
// // Initial working version - Product Detail / no reviews
// // import React, { useEffect, useState } from 'react';
// // import { useParams } from 'react-router-dom';
// // import api from '../api';
// // import ProductReviews from './ProductReviews';
// //
// // interface ProductImage {
// //   id: number;
// //   image: string; // Absolute URL
// //   alt_text: string;
// //   image_url: string; // Absolute URL
// // }
// //
// // interface ProductDetail {
// //   uuid: string;
// //   name: string;
// //   slug: string;
// //   description: string;
// //   price: number;
// //   image: string; // Absolute URL
// //   stock: number;
// //   images: ProductImage[]; // Related images
// //   reviews: any[]; // Adjust based on actual review serializer
// //   average_rating: number;
// //   category: any; // Adjust based on actual category serializer
// //   tags: any[]; // Adjust based on actual tag serializer
// // }
// //
// // // const ProductDetail: React.FC = () => {
// //   const ProductDetail: React.FC<{ isAuthenticated?: boolean }> = ({ isAuthenticated = false }) => {
// //   const { uuid, slug } = useParams<{ uuid: string; slug: string }>();
// //   const [product, setProduct] = useState<ProductDetail | null>(null);
// //   const [loading, setLoading] = useState<boolean>(true);
// //   const [error, setError] = useState<string | null>(null);
// //   const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
// //   const [showLightbox, setShowLightbox] = useState(false);
// //
// //   // Set initial selected image index (if you want to select the first image)
// //   const handleThumbnailClick = (index: number) => {
// //     setSelectedImageIndex(index);
// //     setShowLightbox(true); // Open lightbox when a thumbnail is clicked
// //   };
// //
// //   const toggleLightbox = () => {
// //     setShowLightbox(!showLightbox);
// //   };
// //
// //   const closeLightbox = () => {
// //     setShowLightbox(false);
// //   };
// //
// //   const navigateToNextImage = () => {
// //     if (product && selectedImageIndex !== null) {
// //       const nextIndex = (selectedImageIndex + 1) % product.images.length;
// //       setSelectedImageIndex(nextIndex);
// //     }
// //   };
// //
// //   const navigateToPreviousImage = () => {
// //     if (product && selectedImageIndex !== null) {
// //       const prevIndex = (selectedImageIndex - 1 + product.images.length) % product.images.length;
// //       setSelectedImageIndex(prevIndex);
// //     }
// //   };
// //
// //   useEffect(() => {
// //     const fetchProductDetail = async () => {
// //       try {
// //         const response = await api.get(/products/products/${uuid}/${slug}/);
// //         console.log(response.data); // Inspect API response
// //         setProduct(response.data);
// //       } catch (err) {
// //         setError('Failed to fetch product details.');
// //         console.error(err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //
// //     if (uuid && slug) {
// //       fetchProductDetail();
// //     }
// //   }, [uuid, slug]);
// //
// //   if (loading) {
// //     return (
// //       <div className="container text-center mt-5">
// //         <div className="spinner-border text-primary" role="status">
// //           <span className="visually-hidden">Loading...</span>
// //         </div>
// //       </div>
// //     );
// //   }
// //
// //   if (error) {
// //     return (
// //       <div className="container text-center mt-5">
// //         <p className="text-danger">{error}</p>
// //       </div>
// //     );
// //   }
// //
// //   if (!product) {
// //     return (
// //       <div className="container text-center mt-5">
// //         <p>Product not found.</p>
// //       </div>
// //     );
// //   }
// //
// //   return (
// //     <div className="container mt-5">
// //       <div className="row gx-lg-5">
// //         {/* Product Image and Gallery */}
// //         <div className="col-md-6 mb-4">
// //           <img
// //             src={
// //               product.image ||
// //               (product.images && product.images.length > 0 ? product.images[0].image_url : 'https://via.placeholder.com/500')
// //             }
// //             alt={product.name || 'Product image'}
// //             className="img-fluid rounded mb-4"
// //             style={{ maxHeight: '500px', objectFit: 'cover' }}
// //           />
// //
// //           {/* Gallery Thumbnails */}
// //           <div className="d-flex flex-wrap">
// //             {product.images &&
// //               product.images.map((image, index) => (
// //                 <img
// //                   key={image.id}
// //                   src={image.image_url} // Use absolute URL
// //                   alt={image.alt_text || Gallery ${image.id}}
// //                   className="img-thumbnail me-2 mb-2"
// //                   style={{ width: '100px', height: '100px', objectFit: 'cover' }}
// //                   onClick={() => handleThumbnailClick(index)} // Open clicked image in the gallery
// //                 />
// //               ))}
// //           </div>
// //         </div>
// //
// //         {/* Product Details */}
// //         <div className="col-md-6">
// //           <h1 className="fw-bold">{product.name}</h1>
// //           <p className="text-muted">{product.description}</p>
// //           <p className={text-muted ${product.stock > 0 ? 'text-success' : 'text-danger'}}>
// //             {product.stock > 0 ? In stock: ${product.stock} : 'Out of stock'}
// //           </p>
// //           <h5 className="text-primary">
// //             ${product.price ? parseFloat(product.price.toString()).toFixed(2) : 'N/A'}
// //           </h5>
// //           <div className="mt-4">
// //             <label htmlFor="quantity" className="form-label">
// //               Quantity:
// //             </label>
// //             <input
// //               type="number"
// //               id="quantity"
// //               className="form-control w-25 mb-3"
// //               defaultValue={1}
// //               min={1}
// //             />
// //             <button className="btn btn-primary me-2">Add to Cart</button>
// //             <button className="btn btn-outline-danger">
// //               <i className="fas fa-heart"></i> Add to Wishlist
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //
// //       {/* Lightbox Modal for Enlarged Image */}
// //       {showLightbox && product.images && selectedImageIndex !== null && (
// //         <div className="lightbox-modal" style={{ display: 'flex' }}>
// //           <div className="lightbox-overlay" onClick={closeLightbox}></div>
// //           <div className="lightbox-content">
// //             <img
// //               src={product.images[selectedImageIndex].image_url} // Display the selected image
// //               alt="Enlarged view"
// //               className="img-fluid rounded"
// //               style={{ maxHeight: '80vh', objectFit: 'contain' }}
// //             />
// //             <div className="lightbox-navigation">
// //               <button className="btn btn-light" onClick={navigateToPreviousImage}>
// //                 <i className="fas fa-chevron-left"></i>
// //               </button>
// //               <button className="btn btn-light" onClick={navigateToNextImage}>
// //                 <i className="fas fa-chevron-right"></i>
// //               </button>
// //             </div>
// //             <button className="close-btn" onClick={closeLightbox}>
// //               <i className="fas fa-times"></i>
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //
// //       {/* Reviews Section */}
// //       <div className="mt-5">
// //         <h2>Customer Reviews</h2>
// //         <ProductReviews isAuthenticated={isAuthenticated} />
// // //         <p className="text-muted">No reviews available yet. Be the first to review!</p>
// //       </div>
// //     </div>
// //   );
// // };
// //
// // export default ProductDetail;
//
//
// // Version with Review working - product detail issues
// // import React, { useEffect, useState, useContext } from 'react';
// // import { useParams } from 'react-router-dom';
// // import AuthContext from '../context/AuthContext';
// // import api from '../api';
// // import ProductReviews from './ProductReviews';
// //
// // interface ProductImage {
// //   id: number;
// //   image: string; // Absolute URL
// //   alt_text: string;
// //   image_url: string; // Absolute URL
// // }
// //
// // interface Review {
// //   id: string;
// //   uuid: string;
// //   user: {
// //     name: string; // Adjust based on UserReviewSerializer
// //   };
// //   rating: number;
// //   comment: string;
// //   created: string;
// // }
// //
// // interface ProductDetail {
// //   uuid: string;
// //   name: string;
// //   slug: string;
// //   description: string;
// //   price: number;
// //   image: string; // Absolute URL
// //   stock: number;
// //   images: ProductImage[]; // Related images
// //   reviews: Review[];
// //   average_rating: number;
// // }
// //
// // const ProductDetail: React.FC = () => {
// //   const { uuid, slug } = useParams<{ uuid: string; slug: string }>();
// //   const { user } = useContext(AuthContext); // To check if the user is authenticated
// //   const [product, setProduct] = useState<ProductDetail | null>(null);
// //   const [loading, setLoading] = useState<boolean>(true);
// //   const [error, setError] = useState<string | null>(null);
// //
// //   const [reviews, setReviews] = useState<Review[]>([]);
// //   const [newReview, setNewReview] = useState<{ rating: number; comment: string }>({
// //     rating: 5,
// //     comment: '',
// //   });
// //   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
// //
// //   useEffect(() => {
// //     const fetchProductDetail = async () => {
// //       try {
// //         const response = await api.get(`/products/products/${uuid}/${slug}/`);
// //         setProduct(response.data);
// //
// //         const reviewsResponse = await api.get(
// //           `/products/products/${uuid}/${slug}/reviews/`
// //         );
// //         setReviews(reviewsResponse.data.results || []); // Assuming paginated results
// //       } catch (err) {
// //         setError('Failed to fetch product details.');
// //         console.error(err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //
// //     if (uuid && slug) {
// //       fetchProductDetail();
// //     }
// //   }, [uuid, slug]);
// //
// //   const handleReviewSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //
// //     if (!user) {
// //       alert('You must be logged in to submit a review.');
// //       return;
// //     }
// //
// //     setIsSubmitting(true);
// //     try {
// //       const response = await api.post(
// //         `/products/products/${uuid}/${slug}/reviews/create/`,
// //         newReview
// //       );
// //       setReviews([response.data, ...reviews]); // Add the new review to the list
// //       setNewReview({ rating: 5, comment: '' }); // Reset form
// //     } catch (err) {
// //       console.error(err);
// //       alert('Failed to submit review.');
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };
// //
// //   if (loading) {
// //     return (
// //       <div className="container text-center mt-5">
// //         <div className="spinner-border text-primary" role="status">
// //           <span className="visually-hidden">Loading...</span>
// //         </div>
// //       </div>
// //     );
// //   }
// //
// //   if (error) {
// //     return (
// //       <div className="container text-center mt-5">
// //         <p className="text-danger">{error}</p>
// //       </div>
// //     );
// //   }
// //
// //   if (!product) {
// //     return (
// //       <div className="container text-center mt-5">
// //         <p>Product not found.</p>
// //       </div>
// //     );
// //   }
// //
// //   return (
// //     <div className="container mt-5">
// //       <div className="row">
// //   {/* Product Image */}
// //   <div className="col-md-6">
// //     <img
// //       src={product.image}
// //       alt={product.name}
// //       className="img-fluid rounded"
// //       style={{ maxHeight: '400px', objectFit: 'contain' }}
// //     />
// //   </div>
// //
// //   {/* Product Information */}
// //   <div className="col-md-6">
// //     <h1>{product.name}</h1>
// //     <p className="text-muted">{product.description}</p>
// //     <h3>${product.price ? parseFloat(product.price.toString()).toFixed(2) : 'N/A'}</h3>
// //     <p className="text-success">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
// //
// //     {/* Add to Cart Button (Example) */}
// //     {product.stock > 0 && (
// //       <button className="btn btn-primary mt-3">
// //         Add to Cart
// //       </button>
// //     )}
// //   </div>
// // </div>
// //
// // {/* Product Gallery (Optional) */}
// // <div className="mt-4">
// //   <h4>Other Images</h4>
// //   <div className="row">
// //     {product.images.map((image) => (
// //       <div key={image.id} className="col-4">
// //         <img
// //           src={image.image_url}
// //           alt={image.alt_text}
// //           className="img-fluid rounded"
// //           style={{ cursor: 'pointer' }}
// //           onClick={() => window.open(image.image_url, '_blank')}
// //         />
// //       </div>
// //     ))}
// //   </div>
// // </div>
// //
// //       <div className="mt-5">
// //         <h2>Customer Reviews</h2>
// //         {reviews.length > 0 ? (
// //           reviews.map((review) => (
// //             <div key={review.uuid} className="border rounded p-3 mb-3">
// //               <h5>{review.user.name}</h5>
// //               <p className="mb-1">Rating: {review.rating} / 5</p>
// //               <p>{review.comment}</p>
// //               <p className="text-muted" style={{ fontSize: '0.9rem' }}>
// //                 {new Date(review.created).toLocaleDateString()}
// //               </p>
// //             </div>
// //           ))
// //         ) : (
// //           <p className="text-muted">No reviews yet. Be the first to review!</p>
// //         )}
// //
// //         {user ? (
// //           <form className="mt-4" onSubmit={handleReviewSubmit}>
// //             <div className="mb-3">
// //               <label htmlFor="rating" className="form-label">
// //                 Rating
// //               </label>
// //               <select
// //                 id="rating"
// //                 className="form-select"
// //                 value={newReview.rating}
// //                 onChange={(e) =>
// //                   setNewReview({ ...newReview, rating: Number(e.target.value) })
// //                 }
// //                 required
// //               >
// //                 {[1, 2, 3, 4, 5].map((rating) => (
// //                   <option key={rating} value={rating}>
// //                     {rating}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>
// //             <div className="mb-3">
// //               <label htmlFor="comment" className="form-label">
// //                 Comment
// //               </label>
// //               <textarea
// //                 id="comment"
// //                 className="form-control"
// //                 rows={3}
// //                 value={newReview.comment}
// //                 onChange={(e) =>
// //                   setNewReview({ ...newReview, comment: e.target.value })
// //                 }
// //                 required
// //               ></textarea>
// //             </div>
// //             <button
// //               type="submit"
// //               className="btn btn-primary"
// //               disabled={isSubmitting}
// //             >
// //               {isSubmitting ? 'Submitting...' : 'Submit Review'}
// //             </button>
// //           </form>
// //         ) : (
// //           <p className="text-muted mt-3">
// //             <a href="/login">Log in</a> to leave a review.
// //           </p>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };
// //
// // export default ProductDetail;