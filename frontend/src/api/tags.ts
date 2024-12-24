// src/api/tags.ts
import api from './api';

export interface Tag {
  uuid: string;
  name: string;
  slug: string;
}

export async function fetchTags() {
  const response = await api.get('/products/tags/');
  return response.data;
}

export async function fetchTagDetail(slug: string) {
  const response = await api.get(`/products/tags/${slug}/`);
  return response.data;
}
