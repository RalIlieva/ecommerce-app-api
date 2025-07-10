// src/tests/VendorProductDetail.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// 1) Partially mock react-bootstrap, preserving all original exports except Modal/Alert
vi.mock('react-bootstrap', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    Modal: (props: any) => <div>{props.children}</div>,
    Alert: (props: any) => <div role="alert">{props.children}</div>,
  };
});

// 2) Mock our API
vi.mock('../api', () => ({
  default: { get: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
import api from '../api';

// 3) Mock useNavigate but keep MemoryRouter/Routes working
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import VendorProductDetail from '../pages/vendor/VendorProductDetail';

// A working product object
const GOOD_PRODUCT = {
  uuid: 'prod-123',
  slug: 'my-product',
  name: 'My Product',
  description: 'A great product',
  price: 99.99,
  stock: 5,
  category: { name: 'Cat A' },
  tags: [{ name: 'Tag1' }, { name: 'Tag2' }],
};

// Helper to stub exactly 3 GET calls: detail, categories, tags
function stubThreeGets(data: any) {
  (api.get as any).mockReset();
  (api.get as any).mockResolvedValueOnce({ data });
  (api.get as any).mockResolvedValueOnce({ data: { results: [] } });
  (api.get as any).mockResolvedValueOnce({ data: { results: [] } });
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/vendor/products/prod-123/my-product']}>
      <Routes>
        <Route
          path="/vendor/products/:uuid/:slug"
          element={<VendorProductDetail />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('VendorProductDetail (basic fetch)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders loading then the H2 heading with product name', async () => {
    stubThreeGets(GOOD_PRODUCT);
    renderDetail();

    // “Loading...” shows first
    expect(screen.getByText('Loading...')).toBeTruthy();

    // Then H2 “Product Detail - My Product”
    const heading = await screen.findByRole('heading', {
      level: 2,
      name: /Product Detail - My Product/,
    });
    expect(heading).toBeTruthy();
  });

  it('shows an error alert on fetch failure', async () => {
    (api.get as any).mockReset();
    (api.get as any).mockRejectedValueOnce(new Error('Network'));
    // two more to satisfy categories/tags
    (api.get as any).mockResolvedValueOnce({ data: { results: [] } });
    (api.get as any).mockResolvedValueOnce({ data: { results: [] } });

    renderDetail();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Failed to load product details.');
  });

  it('shows "Product not found." if API returns null', async () => {
    stubThreeGets(null);
    renderDetail();

    await waitFor(() =>
      expect(screen.getByText('Product not found.')).toBeTruthy()
    );
  });
});
