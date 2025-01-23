import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';
import { Review } from '../types';

// Props interface
interface ProductReviewsProps {
  productUuid: string;
  productSlug: string;
  isAuthenticated: boolean;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({
  productUuid,
  productSlug,
  isAuthenticated,
}) => {
  const { user } = useContext(AuthContext);

  // Store all reviews
  const [reviews, setReviews] = useState<Review[]>([]);

  // New review form state
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });

  // For controlling messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Whether we are editing a review (store the review's UUID if editing)
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // The data for editing
  const [editData, setEditData] = useState({ rating: 0, comment: '' });

  // Fetch existing reviews on mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get(
          `/products/products/${productUuid}/${productSlug}/reviews/`
        );
        setReviews(response.data.results || []);
      } catch (err) {
        setError('Failed to load reviews.');
      }
    };

    fetchReviews();
  }, [productUuid, productSlug]);

  // ---- CREATE NEW REVIEW ----
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!newReview.rating || !newReview.comment.trim()) {
      setError('Please provide both a rating and a comment.');
      return;
    }

    try {
      await api.post(
        `/products/products/${productUuid}/${productSlug}/reviews/create/`,
        {
          rating: newReview.rating,
          comment: newReview.comment,
        }
      );
      setNewReview({ rating: 0, comment: '' });
      setSuccess(true);
      // Reload the reviews
      const response = await api.get(
        `/products/products/${productUuid}/${productSlug}/reviews/`
      );
      setReviews(response.data.results || []);
    } catch (err: any) {
      if (err.response?.status === 400) {
        // Possibly "You have already reviewed this product."
        const detail = err.response?.data?.detail;
        const nonFieldErrors = detail?.non_field_errors || [];
        if (nonFieldErrors.includes('You have already reviewed this product.')) {
          setError('You have already reviewed this product.');
        } else {
          setError('Bad Request. Please check your data.');
        }
      } else {
        setError('Failed to submit review.');
      }
    }
  };

  // ---- START EDITING A REVIEW ----
  const startEditing = (review: Review) => {
    setIsEditing(review.uuid);
    setEditData({ rating: review.rating, comment: review.comment });
  };

  // ---- SUBMIT EDIT (UPDATE) ----
  const handleEditSubmit = async (e: React.FormEvent, reviewUuid: string) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!editData.rating || !editData.comment.trim()) {
      setError('Please provide both a rating and a comment.');
      return;
    }

    try {
      await api.put(
        `/products/products/${productUuid}/${productSlug}/reviews/${reviewUuid}/`,
        {
          rating: editData.rating,
          comment: editData.comment,
        }
      );
      setIsEditing(null);
      // Reload
      const response = await api.get(
        `/products/products/${productUuid}/${productSlug}/reviews/`
      );
      setReviews(response.data.results || []);
    } catch (err) {
      setError('Failed to update review.');
    }
  };

  // ---- DELETE REVIEW ----
  const handleDelete = async (reviewUuid: string) => {
    setError(null);
    setSuccess(false);
    try {
      await api.delete(
        `/products/products/${productUuid}/${productSlug}/reviews/${reviewUuid}/`
      );
      // Filter out the deleted review from state
      setReviews((prev) => prev.filter((r) => r.uuid !== reviewUuid));
    } catch (err) {
      setError('Failed to delete review.');
    }
  };

  // ---- HELPER: RENDER STARS (1-5) ----
  const renderStars = (rating: number): JSX.Element[] => {
    // We'll return an array of star <i> elements
    const starsArray: JSX.Element[] = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        starsArray.push(<i key={i} className="fas fa-star text-warning me-1"></i>);
      } else {
        starsArray.push(<i key={i} className="far fa-star text-muted me-1"></i>);
      }
    }
    return starsArray;
  };

  return (
    <div className="product-reviews mt-4">
      <h3>Reviews</h3>

      {/* Show any success/error messages */}
      {success && <div className="alert alert-success">Review submitted!</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Review list */}
      {reviews.length === 0 ? (
        <p>No reviews yet. Be the first to leave one!</p>
      ) : (
        <ul className="list-group mb-4">
          {reviews.map((review) => (
            <li key={review.uuid} className="list-group-item">
              <strong>{review.user.name}</strong>
              <div>{renderStars(review.rating)}</div>
              <p>{review.comment}</p>
              <small className="text-muted">
                {new Date(review.created).toLocaleDateString()}
              </small>

              {/* Show Edit/Delete buttons if the user is the owner */}
              {user && user.uuid === review.user.uuid && (
                <div className="mt-2">
                  {isEditing === review.uuid ? (
                    // Edit Form
                    <form onSubmit={(e) => handleEditSubmit(e, review.uuid)}>
                      <label className="form-label">
                        Rating:
                        <select
                          className="form-select"
                          value={editData.rating}
                          onChange={(ev) =>
                            setEditData({ ...editData, rating: Number(ev.target.value) })
                          }
                        >
                          {[1, 2, 3, 4, 5].map((val) => (
                            <option key={val} value={val}>
                              {val}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="form-label">
                        Comment:
                        <textarea
                          className="form-control mb-2"
                          rows={2}
                          value={editData.comment}
                          onChange={(ev) =>
                            setEditData({ ...editData, comment: ev.target.value })
                          }
                        />
                      </label>
                      <button type="submit" className="btn btn-sm btn-primary me-2">
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => setIsEditing(null)}
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    // Edit/Delete Buttons
                    <>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => startEditing(review)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(review.uuid)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* New Review Form */}
      {isAuthenticated ? (
        <form onSubmit={handleReviewSubmit}>
          <div className="mb-3">
            <label htmlFor="rating" className="form-label">
              Rating (1-5)
            </label>
            <select
              id="rating"
              className="form-select"
              value={newReview.rating}
              onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
            >
              <option value={0}>Select Rating</option>
              {[1, 2, 3, 4, 5].map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="comment" className="form-label">
              Comment
            </label>
            <textarea
              id="comment"
              className="form-control"
              rows={3}
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Submit Review
          </button>
        </form>
      ) : (
        <p>
          <a href="/login">Log in</a> to leave a review.
        </p>
      )}
    </div>
  );
};

export default ProductReviews;



// // src/components/ProductReviews.tsx
// import React, { useEffect, useState, useContext } from 'react';
// import api from '../api';
// import AuthContext from '../context/AuthContext';
// import { Review } from '../types';
//
// interface ProductReviewsProps {
//   productUuid: string;
//   productSlug: string;
//   isAuthenticated: boolean;
// }
//
// const ProductReviews: React.FC<ProductReviewsProps> = ({
//   productUuid,
//   productSlug,
//   isAuthenticated,
// }) => {
//   const { user } = useContext(AuthContext);
//
//   const [reviews, setReviews] = useState<Review[]>([]);
//   const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<boolean>(false);
//
//   // For editing an existing review (optional):
//   const [isEditing, setIsEditing] = useState<string | null>(null); // store review UUID if editing
//   const [editData, setEditData] = useState({ rating: 0, comment: '' });
//
//   // 1) Fetch existing reviews
//   useEffect(() => {
//     const fetchReviews = async () => {
//       try {
//         const response = await api.get(
//           `/products/products/${productUuid}/${productSlug}/reviews/`
//         );
//         setReviews(response.data.results || []);
//       } catch (err) {
//         setError('Failed to load reviews.');
//       }
//     };
//     fetchReviews();
//   }, [productUuid, productSlug]);
//
//   // 2) Handle create new review
//   const handleReviewSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(false);
//
//     if (!newReview.rating || !newReview.comment.trim()) {
//       setError('Please provide both a rating and a comment.');
//       return;
//     }
//     try {
//       await api.post(
//         `/products/products/${productUuid}/${productSlug}/reviews/create/`,
//         {
//           rating: newReview.rating,
//           comment: newReview.comment,
//         }
//       );
//       setNewReview({ rating: 0, comment: '' });
//       setSuccess(true);
//       // Reload reviews
//       const response = await api.get(
//         `/products/products/${productUuid}/${productSlug}/reviews/`
//       );
//       setReviews(response.data.results || []);
//     } catch (err: any) {
//       // If backend returns a 400 with "You have already reviewed this product."
//       if (err.response?.status === 400) {
//         setError(err.response?.data?.detail?.non_field_errors?.[0] || 'Bad Request');
//       } else {
//         setError('Failed to submit review.');
//       }
//     }
//   };
//
//   // 3) Handle edit (optional)
//   const startEditing = (review: Review) => {
//     setIsEditing(review.uuid);
//     setEditData({ rating: review.rating, comment: review.comment });
//   };
//
//   const handleEditSubmit = async (e: React.FormEvent, reviewUuid: string) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(false);
//     if (!editData.rating || !editData.comment.trim()) {
//       setError('Please provide both a rating and a comment.');
//       return;
//     }
//     try {
//       await api.put(
//         `/products/products/${productUuid}/${productSlug}/reviews/${reviewUuid}/`,
//         {
//           rating: editData.rating,
//           comment: editData.comment,
//         }
//       );
//       setIsEditing(null);
//       // Reload
//       const response = await api.get(
//         `/products/products/${productUuid}/${productSlug}/reviews/`
//       );
//       setReviews(response.data.results || []);
//     } catch (err) {
//       setError('Failed to update review.');
//     }
//   };
//
//   // 4) Handle delete (optional)
//   const handleDelete = async (reviewUuid: string) => {
//     setError(null);
//     setSuccess(false);
//     try {
//       await api.delete(
//         `/products/products/${productUuid}/${productSlug}/reviews/${reviewUuid}/`
//       );
//       setReviews((prev) => prev.filter((r) => r.uuid !== reviewUuid));
//     } catch (err) {
//       setError('Failed to delete review.');
//     }
//   };
//
//   return (
//     <div className="product-reviews mt-3">
//       <h3>Reviews</h3>
//
//       {/* Display success/error */}
//       {success && <div className="alert alert-success">Review submitted!</div>}
//       {error && <div className="alert alert-danger">{error}</div>}
//
//       {/* List of reviews */}
//       {reviews.length === 0 ? (
//         <p>No reviews yet. Be the first to leave one!</p>
//       ) : (
//         <ul className="list-group mb-4">
//           {reviews.map((review) => (
//             <li key={review.uuid} className="list-group-item">
//               <strong>{review.user.name}</strong>
//               <span> - {review.rating} stars</span>
//               <p>{review.comment}</p>
//               <small>{new Date(review.created).toLocaleDateString()}</small>
//
//               {/* Check if this user is the author */}
//               {user && user.uuid === review.user.uuid && (
//                 <div className="mt-2">
//                   {/* Edit Button */}
//                   {isEditing === review.uuid ? (
//                     <form onSubmit={(e) => handleEditSubmit(e, review.uuid)}>
//                       <label>
//                         Rating:
//                         <select
//                           value={editData.rating}
//                           onChange={(ev) =>
//                             setEditData({ ...editData, rating: Number(ev.target.value) })
//                           }
//                         >
//                           {[1, 2, 3, 4, 5].map((val) => (
//                             <option key={val} value={val}>
//                               {val}
//                             </option>
//                           ))}
//                         </select>
//                       </label>
//                       <label>
//                         Comment:
//                         <textarea
//                           value={editData.comment}
//                           onChange={(ev) => setEditData({ ...editData, comment: ev.target.value })}
//                         />
//                       </label>
//                       <button type="submit" className="btn btn-sm btn-primary me-2">Save</button>
//                       <button
//                         type="button"
//                         className="btn btn-sm btn-secondary"
//                         onClick={() => setIsEditing(null)}
//                       >
//                         Cancel
//                       </button>
//                     </form>
//                   ) : (
//                     <>
//                       <button
//                         className="btn btn-sm btn-outline-primary me-2"
//                         onClick={() => startEditing(review)}
//                       >
//                         Edit
//                       </button>
//                       <button
//                         className="btn btn-sm btn-outline-danger"
//                         onClick={() => handleDelete(review.uuid)}
//                       >
//                         Delete
//                       </button>
//                     </>
//                   )}
//                 </div>
//               )}
//             </li>
//           ))}
//         </ul>
//       )}
//
//       {/* New Review Form */}
//       {isAuthenticated ? (
//         <form onSubmit={handleReviewSubmit}>
//           <div className="mb-3">
//             <label htmlFor="rating" className="form-label">
//               Rating (1-5)
//             </label>
//             <select
//               id="rating"
//               className="form-select"
//               value={newReview.rating}
//               onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
//             >
//               <option value={0}>Select Rating</option>
//               {[1, 2, 3, 4, 5].map((val) => (
//                 <option key={val} value={val}>
//                   {val}
//                 </option>
//               ))}
//             </select>
//           </div>
//
//           <div className="mb-3">
//             <label htmlFor="comment" className="form-label">
//               Comment
//             </label>
//             <textarea
//               id="comment"
//               className="form-control"
//               rows={3}
//               value={newReview.comment}
//               onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
//             ></textarea>
//           </div>
//
//           <button type="submit" className="btn btn-primary">
//             Submit Review
//           </button>
//         </form>
//       ) : (
//         <p>
//           <a href="/login">Log in</a> to leave a review.
//         </p>
//       )}
//     </div>
//   );
// };
//
// export default ProductReviews;
