// // src/__tests__/VendorOrderDetails.test.tsx
//
// import React from 'react';
// import { rest } from 'msw';
// import { setupServer } from 'msw/node';
// import { render, screen, waitFor, fireEvent } from '@testing-library/react';
// import { MemoryRouter, Route, Routes } from 'react-router-dom';
// import VendorOrderDetails from '../pages/vendor/VendorOrderDetails';
// import api from '../api';
// import { Order } from '../api/orders';
//
// // Mock server for API
// const mockOrder: Order = {
//   id: 1,
//   uuid: 'order-uuid',
//   user: 2,
//   user_email: 'test@example.com',
//   user_name: 'Test User',
//   status: 'pending',
//   created: new Date().toISOString(),
//   modified: new Date().toISOString(),
//   items: [
//     { id: 10, product: { name: 'Product A' }, quantity: 2, price: 9.99 }
//   ],
//   shipping_address: {
//     full_name: 'John Doe',
//     address_line_1: '123 Main St',
//     address_line_2: '',
//     city: 'Townsville',
//     postal_code: '12345',
//     country: 'Country',
//     phone_number: '555-1234'
//   }
// };
//
// const server = setupServer(
//   rest.get('http://localhost:8000/api/v1/vendor/orders/:order_uuid/', (req, res, ctx) => {
//     return res(ctx.json(mockOrder));
//   }),
//   rest.patch('http://localhost:8000/api/v1/vendor/orders/order-uuid/status/', (req, res, ctx) => {
//     const updated = { ...mockOrder, status: 'shipped' };
//     return res(ctx.json(updated));
//   })
// );
//
// // Start and stop server
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());
//
// test('renders order details and updates status', async () => {
//   render(
//     <MemoryRouter initialEntries={["/vendor/orders/order-uuid"]}>
//       <Routes>
//         <Route path="/vendor/orders/:order_uuid" element={<VendorOrderDetails />} />
//       </Routes>
//     </MemoryRouter>
//   );
//
//   // Wait for order overview to appear
//   expect(await screen.findByText(/Order Overview/i)).toBeInTheDocument();
//
//   // Check user email and name
//   expect(screen.getByText(/Test User/)).toBeInTheDocument();
//   expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
//
//   // Initial status
//   expect(screen.getByText(/Status: pending/)).toBeInTheDocument();
//
//   // Change status via select
//   fireEvent.change(screen.getByLabelText(/Update Order Status/i), {
//     target: { value: 'shipped' }
//   });
//
//   // Click save
//   fireEvent.click(screen.getByRole('button', { name: /Save Status/i }));
//
//   // Wait for success message
//   expect(await screen.findByText(/Order status updated successfully/i)).toBeInTheDocument();
//
//   // Confirm status updated in UI
//   expect(screen.getByText(/Status: shipped/)).toBeInTheDocument();
// });


// // src/tests/VendorOrderDetails.test.tsx
//
// import React from 'react';
// import { render, screen, fireEvent } from '@testing-library/react';
// import { MemoryRouter, Route, Routes } from 'react-router-dom';
// import VendorOrderDetails from '../pages/vendor/VendorOrderDetails';
// import { Order } from '../api/orders';
// import { vi } from 'vitest';  // ✅ Vitest's global mocking
//
// // ✅ Mock Order object
// const mockOrder: Order = {
//   id: 1,
//   uuid: 'order-uuid',
//   user: 2,
//   user_email: 'test@example.com',
//   user_name: 'Test User',
//   status: 'pending',
//   created: new Date().toISOString(),
//   modified: new Date().toISOString(),
//   items: [
//     { id: 10, product: { name: 'Product A' }, quantity: 2, price: 9.99 },
//   ],
//   shipping_address: {
//     full_name: 'John Doe',
//     address_line_1: '123 Main St',
//     address_line_2: '',
//     city: 'Townsville',
//     postal_code: '12345',
//     country: 'Country',
//     phone_number: '555-1234',
//   },
// };
//
// // ✅ Mock the entire api module using Vitest
// vi.mock('../api', () => ({
//   default: {
//     get: vi.fn(() => Promise.resolve({ data: mockOrder })),
//     patch: vi.fn(() =>
//       Promise.resolve({ data: { ...mockOrder, status: 'shipped' } })
//     ),
//   },
// }));
//
// import api from '../api';  // Must come after the mock
//
// describe('VendorOrderDetails', () => {
//   test('renders order details and updates status', async () => {
//     render(
//       <MemoryRouter initialEntries={['/vendor/orders/order-uuid']}>
//         <Routes>
//           <Route
//             path="/vendor/orders/:order_uuid"
//             element={<VendorOrderDetails />}
//           />
//         </Routes>
//       </MemoryRouter>
//     );
//
//     // Wait for initial render
//     expect(await screen.findByText(/Order Overview/i)).toBeInTheDocument();
//     expect(screen.getByText(/Test User/)).toBeInTheDocument();
//     expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
//     expect(screen.getByText(/Status: pending/)).toBeInTheDocument();
//
//     // Change status
//     fireEvent.change(screen.getByLabelText(/Update Order Status/i), {
//       target: { value: 'shipped' },
//     });
//
//     fireEvent.click(screen.getByRole('button', { name: /Save Status/i }));
//
//     // Wait for success message
//     expect(await screen.findByText(/Order status updated successfully/i)).toBeInTheDocument();
//     expect(screen.getByText(/Status: shipped/)).toBeInTheDocument();
//
//     // ✅ Verify API calls
//     expect(api.get).toHaveBeenCalledWith('/vendor/orders/order-uuid/');
//     expect(api.patch).toHaveBeenCalledWith('/vendor/orders/order-uuid/status/', { status: 'shipped' });
//   });
// });


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
