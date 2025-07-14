// src/tests/VendorProductDetail.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import VendorProductDetail from '../pages/vendor/VendorProductDetail';
import api from '../api';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock React-Bootstrap components
vi.mock('react-bootstrap', () => {
  // Basic layout components
  const Container = (p: any) => <div>{p.children}</div>;
  const Row = (p: any) => <div>{p.children}</div>;
  const Col = (p: any) => <div>{p.children}</div>;
  const Button = (p: any) => <button {...p}>{p.children}</button>;

  // Modal with subcomponents
  const Modal = (p: any) => <div>{p.children}</div>;
  Modal.Header = (p: any) => <div>{p.children}</div>;
  Modal.Body = (p: any) => <div>{p.children}</div>;
  Modal.Title = (p: any) => <h2>{p.children}</h2>;

  // Other components
  const Alert = (p: any) => <div role="alert">{p.children}</div>;
  const Spinner = () => <div>Loading...</div>;
  const Form = {
    Group: (p: any) => <div>{p.children}</div>,
    Control: (p: any) => <input {...p} />,
    Select: (p: any) => <select {...p}>{p.children}</select>
  };
  const Table = (p: any) => <table>{p.children}</table>;

  return { Container, Row, Col, Button, Modal, Alert, Spinner, Form, Table };
}););

// Mock child components
vi.mock('../components/ProductForm', () => ({ __esModule: true, default: () => <div data-testid="mock-form"/> }));
vi.mock('../components/ProductImageManager', () => ({ __esModule: true, default: () => <div data-testid="mock-image-manager"/> }));

vi.mock('../api');
const mockedGet = api.get as vi.Mock;

function stubThreeGets(data: any) {
  mockedGet.mockReset();
  mockedGet.mockResolvedValueOnce({ data });                 // product detail
  mockedGet.mockResolvedValueOnce({ data: { results: [] } }); // categories
  mockedGet.mockResolvedValueOnce({ data: { results: [] } }); // tags
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={["/vendor/products/prod-123/my-product"]}>
      <Routes>
        <Route path="/vendor/products/:uuid/:slug" element={<VendorProductDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('VendorProductDetail (basic fetch)', () => {
  beforeEach(() => vi.resetAllMocks());

  it('renders loading then the H2 heading with product name', async () => {
    stubThreeGets({ name: 'My Product' });
    renderDetail();

    expect(screen.getByText('Loading...')).toBeTruthy();

    // find by text instead of role lookup
    const heading = await screen.findByText(/Product Detail - My Product/);
    expect(heading).toBeTruthy();
  });

  it('shows an error alert on fetch failure', async () => {
    mockedGet.mockRejectedValueOnce(new Error('oops'));
    mockedGet.mockResolvedValueOnce({ data: { results: [] } });
    mockedGet.mockResolvedValueOnce({ data: { results: [] } });

    renderDetail();
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Failed to load product details.');
  });

  it('shows "Product not found." if API returns null', async () => {
    stubThreeGets(null);
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText('Product not found.')).toBeTruthy();
    });
  });
});
