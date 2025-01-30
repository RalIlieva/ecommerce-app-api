// src/api/reviews.ts
import api from '../api';
import { Review } from '../types';

// export interface Review {
//   uuid: string;
//   rating: number;
//   comment: string;
//   created: string;
//   user: {
//     email: string;
//     // Add other user fields if necessary
//   };
// }

export async function fetchReviewsByProduct(uuid: string, slug: string, params?: Record<string, any>) {
  const response = await api.get(`/products/products/${uuid}/${slug}/reviews/`, { params });
  return response.data;
}

export async function createReview(uuid: string, slug: string, data: { rating: number; comment: string }) {
  const response = await api.post(`/products/products/${uuid}/${slug}/reviews/`, data);
  return response.data;
}
