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

// // src/utils.tsx
// import React from 'react';
//
// /**
//  * Renders star icons for a given numeric rating, 1-5.
//  * If rating is 4.6, we round to 5. If 4.4, we round to 4, etc.
//  */
// export function renderStars(rating: number): JSX.Element[] {
//   const stars: JSX.Element[] = [];
//   // Round if you only support whole-number ratings
//   // or handle half-stars if you prefer more precision.
//   const roundedRating = Math.round(rating);
//
//   for (let i = 1; i <= 5; i++) {
//     if (i <= roundedRating) {
//       stars.push(<i key={i} className="fas fa-star text-warning me-1"></i>);
//     } else {
//       stars.push(<i key={i} className="far fa-star text-muted me-1"></i>);
//     }
//   }
//   return stars;
// }
