import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../api';

interface Review {
  id: string;
  uuid: string;
  user: {
    name: string;
  };
  rating: number;
  comment: string;
  created: string;
}

const ProductReviews: React.FC<{ productUuid: string; productSlug: string; isAuthenticated: boolean }> = ({
  productUuid,
  productSlug,
  isAuthenticated,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get(`/products/${productUuid}/${productSlug}/reviews/`);
        setReviews(response.data.results || []); // Assuming paginated API response
      } catch (err) {
        setError('Failed to load reviews.');
      }
    };

    fetchReviews();
  }, [productUuid, productSlug]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newReview.rating || !newReview.comment) {
      setError('Please provide both a rating and a comment.');
      return;
    }

    try {
      await api.post(`/products/${productUuid}/${productSlug}/reviews/create/`, {
        rating: newReview.rating,
        comment: newReview.comment,
      });
      setNewReview({ rating: 0, comment: '' });
      setSuccess(true);

      // Reload reviews
      const response = await api.get(`/products/${productUuid}/${productSlug}/reviews/`);
      setReviews(response.data.results || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit review.');
    }
  };

  return (
    <div className="product-reviews">
      <h3>Reviews</h3>

      {reviews.length === 0 ? (
        <p>No reviews yet. Be the first to leave one!</p>
      ) : (
        <ul className="list-group mb-4">
          {reviews.map((review) => (
            <li key={review.uuid} className="list-group-item">
              <strong>{review.user.name}</strong>
              <span> - {review.rating} stars</span>
              <p>{review.comment}</p>
              <small>{new Date(review.created).toLocaleDateString()}</small>
            </li>
          ))}
        </ul>
      )}

      {isAuthenticated ? (
        <form onSubmit={handleReviewSubmit}>
          {success && <div className="alert alert-success">Review submitted successfully!</div>}
          {error && <div className="alert alert-danger">{error}</div>}

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
            ></textarea>
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
