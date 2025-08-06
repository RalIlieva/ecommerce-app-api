// src/tests/VendorPaymentManagement.test.tsx
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import VendorPaymentManagement from '../pages/vendor/VendorPaymentManagement';
import api from '../api';
import { MemoryRouter } from 'react-router-dom';

// --- MOCK react-bootstrap ---
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

describe('<VendorPaymentManagement />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading then renders payments table', async () => {
    const paymentsData = [
      { id: 101, uuid: 'u1', order: 5001, amount: '99.99', status: 'Completed' },
      { id: 102, uuid: 'u2', order: 5002, amount: '49.50', status: 'Pending' },
    ];
    mockedGet.mockResolvedValueOnce({ data: { results: paymentsData } });

    render(
      <MemoryRouter>
        <VendorPaymentManagement />
      </MemoryRouter>
    );

    // loading indicator
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    // verify API endpoint call
    await waitFor(() =>
      expect(mockedGet).toHaveBeenCalledWith('/vendor/dashboard/payments/')
    );

    // heading appears
    expect(
      await screen.findByRole('heading', { level: 2, name: /Vendor Payment Management/i })
    ).toBeInTheDocument();

    // scoped row assertions
    const rows = screen.getAllByRole('row');

    // Row for u1
    const row1 = rows.find((r) =>
      within(r).queryByText('u1') && within(r).queryByText('$99.99')
    );
    expect(row1).toBeDefined();
    expect(within(row1!).getByText('101')).toBeInTheDocument();
    expect(within(row1!).getByText('u1')).toBeInTheDocument();
    expect(within(row1!).getByText('5001')).toBeInTheDocument();
    expect(within(row1!).getByText('$99.99')).toBeInTheDocument();
    expect(within(row1!).getByText('Completed')).toBeInTheDocument();

    // Row for u2
    const row2 = rows.find((r) =>
      within(r).queryByText('u2') && within(r).queryByText('$49.50')
    );
    expect(row2).toBeDefined();
    expect(within(row2!).getByText('102')).toBeInTheDocument();
    expect(within(row2!).getByText('u2')).toBeInTheDocument();
    expect(within(row2!).getByText('5002')).toBeInTheDocument();
    expect(within(row2!).getByText('$49.50')).toBeInTheDocument();
    expect(within(row2!).getByText('Pending')).toBeInTheDocument();

    // back to dashboard button
    expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument();
  });

  it('shows error alert when fetch fails', async () => {
    mockedGet.mockRejectedValueOnce(new Error('server error'));

    render(
      <MemoryRouter>
        <VendorPaymentManagement />
      </MemoryRouter>
    );

    // initial loading
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    // then error
    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent('Failed to fetch payments');
  });
});
