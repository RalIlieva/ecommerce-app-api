// src/tests/VendorOrderManagement.test.tsx
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import VendorOrderManagement from '../pages/vendor/VendorOrderManagement';

// --- Mock API ---
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));
import api from '../api';
const mockedGet = api.get as unknown as vi.Mock;

describe('VendorOrderManagement', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading, then renders a row per order (row-based assertions)', async () => {
    const ordersPayload = {
      results: [
        { uuid: 'uuid-1', status: 'processing', created: '2025-08-01T12:00:00Z' },
        { uuid: 'uuid-2', status: 'shipped',    created: '2025-08-02T09:05:00Z' },
      ],
    };
    mockedGet.mockResolvedValueOnce({ data: ordersPayload });

    render(
      <MemoryRouter>
        <VendorOrderManagement />
      </MemoryRouter>
    );

    // Loading indicator (adjust to your component's exact text if different)
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for the table to appear
    const table = await screen.findByRole('table');

    // Grab the tbody (rowgroup) that contains data rows
    const rowgroups = within(table).getAllByRole('rowgroup');
    // Prefer the <tbody> group if present; otherwise take the last group
    const tbody =
      rowgroups.find((rg) => rg.tagName.toLowerCase() === 'tbody') ||
      rowgroups[rowgroups.length - 1];

    // Data rows (exclude the header row which is usually in <thead>)
    const rows = within(tbody).getAllByRole('row');
    expect(rows).toHaveLength(ordersPayload.results.length);

    // Find the specific row by combined text content (works even if broken up by elements)
    const rowForUuid1 = rows.find((r) =>
      (r.textContent || '').includes('uuid-1')
    );
    expect(rowForUuid1).toBeTruthy();

    // Assert other fields on the same row
    const created1 = new Date(ordersPayload.results[0].created).toLocaleDateString();
    expect(rowForUuid1!).toHaveTextContent('processing');
    expect(rowForUuid1!).toHaveTextContent(created1);

    // And the second row
    const rowForUuid2 = rows.find((r) =>
      (r.textContent || '').includes('uuid-2')
    );
    expect(rowForUuid2).toBeTruthy();
    const created2 = new Date(ordersPayload.results[1].created).toLocaleDateString();
    expect(rowForUuid2!).toHaveTextContent('shipped');
    expect(rowForUuid2!).toHaveTextContent(created2);

    // Ensure the fetch happened (no brittle URL assertion)
    await waitFor(() => expect(mockedGet).toHaveBeenCalled());
  });
});
