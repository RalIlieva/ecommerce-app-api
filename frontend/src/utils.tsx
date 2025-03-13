// src/utils.tsx
import React from 'react';

/**
 * Renders star icons for a given numeric rating, 1-5.
 * Supports half-stars (e.g., 4.5 stars).
 */
export function renderStars(rating: number): JSX.Element[] {
  const stars: JSX.Element[] = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<i key={i} className="fas fa-star text-warning me-1"></i>);
    } else if (hasHalfStar && i === fullStars + 1) {
      stars.push(<i key={i} className="fas fa-star-half-alt text-warning me-1"></i>);
    } else {
      stars.push(<i key={i} className="far fa-star text-muted me-1"></i>);
    }
  }
  return stars;
}
