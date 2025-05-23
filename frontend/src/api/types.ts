// src/types.ts

export interface UserData {
  uuid: string;
  name: string;
}


export interface Review {
  uuid: string;
  rating: number;
  comment: string;
  created: string;
  user: {
    email: string;
    // Add other user fields if necessary
  };
}


export interface ProductImage {
  id: number;
  image_url: string;
  alt_text: string;
}

export interface ProductDetail {
  uuid: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: ProductImage[];
  average_rating: number;
  // ...plus any other fields
}

export interface Product {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  price: number;
  stock?: number;
  category?: {
    uuid: string;
    name: string;
    // any other fields
  };
  tags: { uuid: string; name: string }[];
  image?: string; // If ProductMiniSerializer returns 'image'
  average_rating?: number | null;
  // ... etc.
}


// Cart-related interfaces
export interface CartItem {
  id: number;
  uuid: string;
  product: ProductDetail; // or a simplified Product type
  quantity: number;
}

export interface Cart {
  id: number;
  uuid: string;
  user: number; // or a user ID
  items: CartItem[];
}

// The checkout session the backend returns from /checkout/start/
export interface CheckoutSession {
  uuid: string;
  user: number; // or user UUID
  cart: Cart | null;
  shipping_address: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  payment_secret?: string; // The Stripe client_secret
  created?: string;
  modified?: string;
}
