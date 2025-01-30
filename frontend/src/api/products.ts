// src/api/products.ts
import api from '../api';
import { Tag } from './tags';
import { Category } from './categories';
import { Review } from '../types';

export interface Product {
  uuid: string;
  name: string;
  slug: string;
  image: string;
  price: string;
  average_rating?: number;
  category: Category;
  tags: Tag[];
  // Add other fields as necessary
}


export async function fetchProducts(params?: Record<string, any>) {
  const response = await api.get('/products/products/', { params });
  return response.data;
}

export async function fetchProductBySlug(uuid: string, slug: string) {
  const response = await api.get(`/products/products/${uuid}/${slug}/`);
  return response.data;
}

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
