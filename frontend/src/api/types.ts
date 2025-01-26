// src/types.ts

export interface UserData {
  uuid: string;
  name: string;
}

export interface Review {
  uuid: string;
  user: UserData;
  rating: number;
  comment: string;
  created: string; // ISO date string
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

// Cart-related interfaces
export interface CartItem {
  id: number;
  uuid: string;
  product: ProductDetail; // or a simplified Product type if you have one
  quantity: number;
}

export interface Cart {
  id: number;
  uuid: string;
  user: number; // or a user ID
  items: CartItem[];
}


// // src/types.ts
// export interface UserData {
//   uuid: string;
//   name: string;
// }
//
// export interface Review {
//   uuid: string;
//   user: UserData;
//   rating: number;
//   comment: string;
//   created: string; // ISO date string
// }
//
// export interface ProductImage {
//   id: number;
//   image_url: string;
//   alt_text: string;
// }
//
// export interface ProductDetail {
//   uuid: string;
//   name: string;
//   slug: string;
//   description: string;
//   price: number;
//   stock: number;
//   images: ProductImage[];
//   average_rating: number;
//   // ...plus any other fields
// }
