// src/tests/VendorWishlistAggregationManagement.test.tsx
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import VendorWishlistAggregationManagement from '../pages/vendor/VendorWishlistAggregationManagement';
import api from '../api';
import { MemoryRouter } from 'react-router-dom';

// --- MOCK react-bootstrap (lightweight) ---
vi.mock('react-bootstrap', () => {
  const Button: any = (p: any) => <button {...p}>{p.children}</button>;
  const Container: any = (p: any) => <div>{p.children}</div>;
  const Table: any = (p: any) => <table {...p}>{p.children}</table>;
  const Alert: any = (p: any) => <div role="alert">{p.children}</div>;
  return { Button, Container, Table, Alert };
});

// --- MOCK api ---
vi.mock('../api');
const mockedGet = api.get as vi.Mock;

describe('<VendorWishlistAggregationManagement />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading then renders aggregated wishlist data', async () => {
    const payload = [
      {
        product__id: 100,
        product__name: 'WishItem',
        wishlist_count: 7,
      },
      {
        product__id: 200,
        product__name: 'OtherItem',
        wishlist_count: 3,
      },
    ];
    mockedGet.mockResolvedValueOnce({ data: payload });

    render(
      <MemoryRouter>
        <VendorWishlistAggregationManagement />
      </MemoryRouter>
    );

    // initial loading indicator
    expect(screen.getByText(/Loading aggregated wishlist data/i)).toBeInTheDocument();

    // verify API call
    await waitFor(() =>
      expect(mockedGet).toHaveBeenCalledWith('vendor/dashboard/wishlist/aggregation/')
    );

    // heading appears
    expect(
      await screen.findByRole('heading', { level: 2, name: /Aggregated Wishlist Data/i })
    ).toBeInTheDocument();

    // find rows and scope content
    const rows = screen.getAllByRole('row');

    const wishRow = rows.find(
      (r) =>
        within(r).queryByText('WishItem') &&
        within(r).queryByText('100') &&
        within(r).queryByText('7')
    );
    expect(wishRow).toBeDefined();
    expect(within(wishRow!).getByText('WishItem')).toBeInTheDocument();
    expect(within(wishRow!).getByText('100')).toBeInTheDocument();
    expect(within(wishRow!).getByText('7')).toBeInTheDocument();

    const otherRow = rows.find(
      (r) =>
        within(r).queryByText('OtherItem') &&
        within(r).queryByText('200') &&
        within(r).queryByText('3')
    );
    expect(otherRow).toBeDefined();
    expect(within(otherRow!).getByText('OtherItem')).toBeInTheDocument();
    expect(within(otherRow!).getByText('200')).toBeInTheDocument();
    expect(within(otherRow!).getByText('3')).toBeInTheDocument();

    // back to dashboard
    expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument();
  });

  it('shows error when fetch fails', async () => {
    mockedGet.mockRejectedValueOnce(new Error('network error'));

    render(
      <MemoryRouter>
        <VendorWishlistAggregationManagement />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading aggregated wishlist data/i)).toBeInTheDocument();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to fetch aggregated wishlist data.'
    );
  });

  it('renders no data rows when API returns empty array', async () => {
    mockedGet.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <VendorWishlistAggregationManagement />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(mockedGet).toHaveBeenCalledWith('vendor/dashboard/wishlist/aggregation/')
    );

    expect(
      await screen.findByRole('heading', { level: 2, name: /Aggregated Wishlist Data/i })
    ).toBeInTheDocument();

    // Only header row should exist (no data rows with product entries)
    const allRows = screen.getAllByRole('row');
    // header row plus zero data rows => length should be 1
    expect(allRows.length).toBe(1);
  });
});
