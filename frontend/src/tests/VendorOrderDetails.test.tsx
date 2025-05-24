// src/__tests__/VendorOrderDetails.test.tsx

import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import VendorOrderDetails from '../pages/vendor/VendorOrderDetails';
import api from '../api';
import { Order } from '../api/orders';

// Mock server for API
const mockOrder: Order = {
  id: 1,
  uuid: 'order-uuid',
  user: 2,
  user_email: 'test@example.com',
  user_name: 'Test User',
  status: 'pending',
  created: new Date().toISOString(),
  modified: new Date().toISOString(),
  items: [
    { id: 10, product: { name: 'Product A' }, quantity: 2, price: 9.99 }
  ],
  shipping_address: {
    full_name: 'John Doe',
    address_line_1: '123 Main St',
    address_line_2: '',
    city: 'Townsville',
    postal_code: '12345',
    country: 'Country',
    phone_number: '555-1234'
  }
};

const server = setupServer(
  rest.get('http://localhost:8000/api/v1/vendor/orders/:order_uuid/', (req, res, ctx) => {
    return res(ctx.json(mockOrder));
  }),
  rest.patch('http://localhost:8000/api/v1/vendor/orders/order-uuid/status/', (req, res, ctx) => {
    const updated = { ...mockOrder, status: 'shipped' };
    return res(ctx.json(updated));
  })
);

// Start and stop server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('renders order details and updates status', async () => {
  render(
    <MemoryRouter initialEntries={["/vendor/orders/order-uuid"]}>
      <Routes>
        <Route path="/vendor/orders/:order_uuid" element={<VendorOrderDetails />} />
      </Routes>
    </MemoryRouter>
  );

  // Wait for order overview to appear
  expect(await screen.findByText(/Order Overview/i)).toBeInTheDocument();

  // Check user email and name
  expect(screen.getByText(/Test User/)).toBeInTheDocument();
  expect(screen.getByText(/test@example.com/)).toBeInTheDocument();

  // Initial status
  expect(screen.getByText(/Status: pending/)).toBeInTheDocument();

  // Change status via select
  fireEvent.change(screen.getByLabelText(/Update Order Status/i), {
    target: { value: 'shipped' }
  });

  // Click save
  fireEvent.click(screen.getByRole('button', { name: /Save Status/i }));

  // Wait for success message
  expect(await screen.findByText(/Order status updated successfully/i)).toBeInTheDocument();

  // Confirm status updated in UI
  expect(screen.getByText(/Status: shipped/)).toBeInTheDocument();
});
