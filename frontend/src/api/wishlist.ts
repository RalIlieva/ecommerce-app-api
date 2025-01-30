// src/api/wishlist.ts
import api from '../api';
import { Product } from './types';

export interface WishlistItem {
  uuid: string;
  product: Product;
  created: string;
  in_stock: boolean;
}

export interface Wishlist {
  uuid: string;
  user: string;  // or a user UUID
  items: WishlistItem[];
  created: string;
  modified: string;
}

// Fetch the user's wishlist (GET /wishlist/)
export async function fetchWishlist() {
  const response = await api.get<Wishlist>('/wishlist/');
  return response.data;
}

// Add a product to the wishlist (POST /wishlist/add/)
export async function addToWishlist(productUuid: string) {
  // backend expects { product_uuid: <string> }
  await api.post('/wishlist/add/', { product_uuid: productUuid });
}

// Remove a product from the wishlist (DELETE /wishlist/remove/<product_uuid>/)
export async function removeFromWishlist(productUuid: string) {
  await api.delete(`/wishlist/remove/${productUuid}/`);
}

// Move a product from the wishlist to the cart (POST /wishlist/move-to-cart/)
export async function moveWishlistItemToCart(productUuid: string) {
  await api.post('/wishlist/move-to-cart/', { product_uuid: productUuid });
}
