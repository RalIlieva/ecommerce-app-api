// src/tests/VendorOrderManagement.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VendorOrderManagement from '../pages/vendor/VendorOrderManagement';
import { vi } from 'vitest';

// 1. Mock the default export of '../api'
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
  },
}));
import api from '../api';

const mockOrdersResponse = {
  data: {
    results: [
      {
        id: 1,
        uuid: 'uuid-1',
        status: 'pending',
        created: '2025-07-01T09:00:00Z',
      },
      {
        id: 2,
        uuid: 'uuid-2',
        status: 'paid',
        created: '2025-07-02T10:30:00Z',
      },
    ],
  },
};

describe('VendorOrderManagement', () => {
  beforeEach(() => {
    // default fetchOrders returns our two mock orders
    (api.get as any).mockResolvedValue(mockOrdersResponse);
  });

  it('shows loading, then renders a row per order', async () => {
    render(
      <BrowserRouter>
        <VendorOrderManagement />
      </BrowserRouter>
    );

    // initial loading state
    expect(screen.getByText('Loading...')).toBeTruthy();

    // wait for table to render
    await waitFor(() => {
      // the header should be present
      const header = screen.getByText('Vendor Order Management');
      expect(header).toBeTruthy();
    });

    // verify both rows are present
    const row1 = screen.getByText('uuid-1');
    const row2 = screen.getByText('uuid-2');
    expect(row1).toBeTruthy();
    expect(row2).toBeTruthy();

    // verify columns
    expect(screen.getByText('pending')).toBeTruthy();
    expect(screen.getByText('paid')).toBeTruthy();
  });

  it('filters by UUID and email when Search is clicked', async () => {
    render(
      <BrowserRouter>
        <VendorOrderManagement />
      </BrowserRouter>
    );

    // wait initial load
    await waitFor(() => screen.getByText('uuid-1'));

    // prepare a fresh mock for the search call
    (api.get as any).mockResolvedValueOnce({
      data: { results: [mockOrdersResponse.data.results[1]] },
    });

    // fill in filters
    fireEvent.change(screen.getByLabelText('Search by UUID'), {
      target: { value: 'uuid-2' },
    });
    fireEvent.change(screen.getByLabelText('Search by User Email'), {
      target: { value: 'foo@example.com' },
    });

    // click Search
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    // expect api.get called with filters
    await waitFor(() => {
      expect((api.get as any).mock.calls.pop()[1]).toMatchObject({
        params: { uuid: 'uuid-2', email: 'foo@example.com' },
      });
    });

    // now only the one filtered row shows
    expect(screen.getByText('uuid-2')).toBeTruthy();
    expect(screen.queryByText('uuid-1')).toBeNull();
  });

  it('clears filters and reloads all orders when Clear Filters is clicked', async () => {
    render(
      <BrowserRouter>
        <VendorOrderManagement />
      </BrowserRouter>
    );

    // wait initial load
    await waitFor(() => screen.getByText('uuid-1'));

    // change inputs
    fireEvent.change(screen.getByLabelText('Search by UUID'), {
      target: { value: 'something' },
    });
    fireEvent.change(screen.getByLabelText('Search by User Email'), {
      target: { value: 'bar@example.com' },
    });

    // prepare a fresh mock for the clear call
    (api.get as any).mockResolvedValueOnce(mockOrdersResponse);

    // click Clear Filters
    fireEvent.click(screen.getByRole('button', { name: 'Clear Filters' }));

    // ensure inputs were cleared
    expect((screen.getByLabelText('Search by UUID') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Search by User Email') as HTMLInputElement).value).toBe('');

    // expect api.get called without params (or empty object)
    await waitFor(() => {
      const lastCall = (api.get as any).mock.calls.pop();
      // path is first arg, opts second
      expect(lastCall[0]).toBe('/vendor/orders/');
      expect(lastCall[1]).toMatchObject({ params: {} });
    });

    // and the full list shows again
    expect(screen.getByText('uuid-1')).toBeTruthy();
    expect(screen.getByText('uuid-2')).toBeTruthy();
  });

  it('renders "No orders found." when the list is empty', async () => {
    // override to return no results
    (api.get as any).mockResolvedValueOnce({ data: { results: [] } });

    render(
      <BrowserRouter>
        <VendorOrderManagement />
      </BrowserRouter>
    );

    // wait for table
    await waitFor(() => screen.getByText('No orders found.'));

    expect(screen.getByText('No orders found.')).toBeTruthy();
  });
});
