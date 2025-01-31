// src/api/products.ts
import api from '../api';
import { Tag } from './tags';
import { Category } from './categories';
import { Review } from '../types';
import { Product } from '../types'


export async function fetchProducts(params?: Record<string, any>) {
  const response = await api.get('/products/products/', { params });
  return response.data;
}

export async function fetchProductBySlug(uuid: string, slug: string) {
  const response = await api.get(`/products/products/${uuid}/${slug}/`);
  return response.data;
}
