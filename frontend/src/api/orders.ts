// src/api/orders.ts
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
  items: OrderItem[];
}
