import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

interface Review {
  uuid: string;
  user: {
    username: string;
  };
  rating: number;
  comment: string;
  created: string;
}

interface ProductReviewsProps {
  isAuthenticated: boolean;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ isAuthenticated }) => {
  const { uuid, slug } = useParams<{ uuid: string; slug: string }>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for form submission
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get(`/products/${uuid}/${slug}/reviews/`);
        setReviews(response.data.results); // Adjust if paginated
        setAverageRating(
          response.data.average_rating || null // Ensure backend includes average rating
        );
      } catch (err) {
        setError("Failed to fetch reviews.");
      } finally {
        setLoading(false);
      }
    };

    if (uuid && slug) {
      fetchReviews();
    }
  }, [uuid, slug]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!rating || !comment.trim()) {
      setFormError("Rating and comment are required.");
      return;
    }

    try {
      await api.post(`/products/${uuid}/${slug}/reviews/create/`, {
        rating,
        comment,
      });
      setFormSuccess("Review submitted successfully!");
      setRating(5);
      setComment("");

      // Refresh reviews
      const response = await api.get(`/products/${uuid}/${slug}/reviews/`);
      setReviews(response.data.results);
      setAverageRating(response.data.average_rating || null);
    } catch (err) {
      setFormError("Failed to submit review. Please try again.");
    }
  };

  if (loading) {
    return <p>Loading reviews...</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <div className="mt-5">
      <h2>Customer Reviews</h2>
      {averageRating !== null && (
        <p className="text-muted">Average Rating: {averageRating.toFixed(1)} / 5</p>
      )}

      <div className="reviews-list">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.uuid} className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">{review.user.username}</h5>
                <p className="card-text">
                  <strong>Rating:</strong> {review.rating} / 5
                </p>
                <p className="card-text">{review.comment}</p>
                <p className="card-text">
                  <small className="text-muted">
                    Posted on {new Date(review.created).toLocaleDateString()}
                  </small>
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">No reviews available yet. Be the first to review!</p>
        )}
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleFormSubmit} className="mt-4">
          <h3>Leave a Review</h3>
          {formError && <p className="text-danger">{formError}</p>}
          {formSuccess && <p className="text-success">{formSuccess}</p>}

          <div className="mb-3">
            <label htmlFor="rating" className="form-label">
              Rating (1-5):
            </label>
            <select
              id="rating"
              className="form-select"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="comment" className="form-label">
              Comment:
            </label>
            <textarea
              id="comment"
              className="form-control"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary">
            Submit Review
          </button>
        </form>
      ) : (
        <p className="text-muted">Log in to leave a review.</p>
      )}
    </div>
  );
};

export default ProductReviews;
