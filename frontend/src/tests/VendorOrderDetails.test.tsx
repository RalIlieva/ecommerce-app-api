// src/tests/VendorOrderDetails.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VendorOrderDetails from '../pages/vendor/VendorOrderDetails';
import { vi } from 'vitest';

// Mock the default export of '../api'
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));
import api from '../api';

const mockOrder = {
  id: 1,
  uuid: 'test-uuid-123',
  user_name: 'John Doe',
  user_email: 'john@example.com',
  status: 'pending',
  created: '2024-07-04T12:00:00Z',
  modified: '2024-07-04T12:00:00Z',
  user: 42,
  total_amount: 150.0,
  shipping_address: {
    full_name: 'John Doe',
    address_line_1: '123 Main St',
    address_line_2: 'Apt 4',
    city: 'Anytown',
    postal_code: '12345',
    country: 'USA',
    phone_number: '555-555-5555',
  },
  items: [
    {
      id: 101,
      quantity: 2,
      price: 75.0,
      product: {
        name: 'Sample Product',
      },
    },
  ],
};

describe('VendorOrderDetails', () => {
  beforeEach(() => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockOrder });
    (api.patch as jest.Mock).mockResolvedValue({
      data: { ...mockOrder, status: 'shipped' },
    });
  });

  it('renders order details and updates status', async () => {
    render(
      <BrowserRouter>
        <VendorOrderDetails />
      </BrowserRouter>
    );

    // 1) find the "Order Overview" header
    const overviewTitle = await screen.findByText(/Order Overview/i);
    // assert it exists (truthy)
    expect(overviewTitle).toBeTruthy();

    // 2) check the product name rendered
    const productCell = screen.getByText('Sample Product');
    expect(productCell).toBeTruthy();

    // 3) change status to "shipped"
    const select = screen.getByLabelText(/Update Order Status/i);
    fireEvent.change(select, { target: { value: 'shipped' } });

    // 4) click "Save Status"
    const button = screen.getByRole('button', { name: /Save Status/i });
    fireEvent.click(button);

    // 5) wait for success message
    await waitFor(() => {
      const successAlert = screen.getByText(/Order status updated successfully/i);
      expect(successAlert).toBeTruthy();
    });
  });
});
