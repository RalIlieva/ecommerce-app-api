// src/api/orders.ts
export interface ShippingAddress {
  full_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  postal_code: string;
  country: string;
  phone_number: string;
}

export interface OrderItem {
  id: string;
  product: {
    name: string;
  };
  quantity: number;
  price: number;
}

export interface Order {
  uuid: string;
  id: string;
  status: string;
  created: string;
  modified?: string;
  user: number; // or string
  shipping_address?: ShippingAddress;
  total_amount?: string;
  items: OrderItem[];
}
