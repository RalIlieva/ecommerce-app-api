// src/tests/VendorDashboard.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import VendorDashboard from '../pages/vendor/VendorDashboard';
import api from '../api';
import { MemoryRouter } from 'react-router-dom';

// --- MOCK react-bootstrap ---
vi.mock('react-bootstrap', () => {
  const Container: any = (p: any) => <div>{p.children}</div>;
  const Row: any = (p: any) => <div>{p.children}</div>;
  const Col: any = (p: any) => <div>{p.children}</div>;
  const Card: any = (p: any) => <div>{p.children}</div>;
  Card.Body = (p: any) => <div>{p.children}</div>;
  Card.Title = (p: any) => <h3>{p.children}</h3>;
  Card.Text = (p: any) => <p>{p.children}</p>;
  Card.Header = (p: any) => <div>{p.children}</div>;
  const Button: any = (p: any) => <button {...p}>{p.children}</button>;
  const Alert: any = (p: any) => <div role="alert">{p.children}</div>;
  return { Container, Row, Col, Card, Button, Alert };
});

// --- MOCK api ---
vi.mock('../api');
const mockedGet = api.get as vi.Mock;

describe('<VendorDashboard />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders loading then dashboard stats and links', async () => {
    const statsPayload = {
      total_orders: 42,
      total_revenue: '1234.56',
      total_products: 7,
      products: [
        { id: 1, name: 'P1', price: '10.00' },
        { id: 2, name: 'P2', price: '20.00' },
        { id: 3, name: 'P3', price: '30.00' },
      ],
      orders: [
        { id: 101, status: 'New', created: '2025-08-01' },
        { id: 102, status: 'Shipped', created: '2025-07-30' },
      ],
    };
    mockedGet.mockResolvedValueOnce({ data: statsPayload });

    render(
      <MemoryRouter>
        <VendorDashboard />
      </MemoryRouter>
    );

    // initial loading text
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    // fetch call
    await waitFor(() =>
      expect(mockedGet).toHaveBeenCalledWith('/vendor/dashboard/dashboard/')
    );

    // heading
    expect(await screen.findByText('Vendor Dashboard')).toBeInTheDocument();

    // Stats
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$1234.56')).toBeInTheDocument();
    expect(screen.getByText('Total Products')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();

    // Quick action buttons
    ['Manage Products', 'Manage Orders', 'Manage Payments',
     'View Cart Aggregation', 'View Wishlist Aggregation'
    ].forEach((label) => {
      expect(screen.getByRole('button', { name: new RegExp(label, 'i') })).toBeInTheDocument();
    });

    // Top Products (text assertion)
    const top = screen.getByText('Top Products').parentElement!;
    ['P1 - $10.00', 'P2 - $20.00', 'P3 - $30.00'].forEach(text =>
      expect(top).toHaveTextContent(text)
    );

    // Recent Orders
    const recent = screen.getByText('Recent Orders').parentElement!;
    ['Order ID: 101 | Status: New | Created: 2025-08-01',
     'Order ID: 102 | Status: Shipped | Created: 2025-07-30'
    ].forEach(text =>
      expect(recent).toHaveTextContent(text)
    );
  });

  it('shows error alert on fetch failure', async () => {
    mockedGet.mockRejectedValueOnce(new Error('fail'));

    render(
      <MemoryRouter>
        <VendorDashboard />
      </MemoryRouter>
    );

    // initial loading
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    // then error
    expect(await screen.findByRole('alert'))
      .toHaveTextContent('Failed to load dashboard data.');
  });
});
