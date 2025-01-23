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
