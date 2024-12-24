// src/api/categories.ts
import api from './api';

export interface Category {
  uuid: string;
  name: string;
  slug: string;
  parent?: string; // UUID of the parent category, if any
}

export async function fetchCategories() {
  const response = await api.get('/products/categories/');
  return response.data;
}

export async function fetchCategoryDetail(slug: string) {
  const response = await api.get(`/products/categories/${slug}/`);
  return response.data;
}
