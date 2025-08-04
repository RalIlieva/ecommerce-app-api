// // src/tests/VendorCartAggregationManagement.test.tsx
// import React from 'react';
// import { render, screen, waitFor } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import { vi } from 'vitest';
// import VendorCartAggregationManagement from '../pages/vendor/VendorCartAggregationManagement';
// import api from '../api';
// import { MemoryRouter } from 'react-router-dom';
//
// // --- MOCK react-bootstrap (lightweight replacements) ---
// vi.mock('react-bootstrap', () => {
//   const Button: any = (p: any) => <button {...p}>{p.children}</button>;
//   const Container: any = (p: any) => <div>{p.children}</div>;
//   const Table: any = (p: any) => <table {...p}>{p.children}</table>;
//   const Alert: any = (p: any) => <div role="alert">{p.children}</div>;
//   return { Button, Container, Table, Alert };
// });
//
// // --- MOCK api ---
// vi.mock('../api');
// const mockedGet = api.get as vi.Mock;
//
// describe('<VendorCartAggregationManagement />', () => {
//   beforeEach(() => {
//     vi.resetAllMocks();
//   });
//
//   it('shows loading then renders aggregated data', async () => {
//     const payload = [
//       {
//         product__id: 1,
//         product__name: 'Widget',
//         total_quantity: 10,
//         item_count: 2,
//       },
//       {
//         product__id: 2,
//         product__name: 'Gadget',
//         total_quantity: 5,
//         item_count: 1,
//       },
//     ];
//     mockedGet.mockResolvedValueOnce({ data: payload });
//
//     render(
//       <MemoryRouter>
//         <VendorCartAggregationManagement />
//       </MemoryRouter>
//     );
//
//     // initial loading indicator
//     expect(screen.getByText(/Loading/i)).toBeInTheDocument();
//
//     // after fetch, heading appears
//     expect(
//       await screen.findByRole('heading', { level: 2, name: /Aggregated Cart Data/i })
//     ).toBeInTheDocument();
//
//     // table rows: header + 2 data rows => total at least 3 rows
//     const rows = screen.getAllByRole('row');
//     expect(rows.length).toBeGreaterThanOrEqual(3);
//
//     // check that payload values are rendered
//     expect(screen.getByText('Widget')).toBeInTheDocument();
//     expect(screen.getByText('Gadget')).toBeInTheDocument();
//     expect(screen.getByText('10')).toBeInTheDocument();
//     expect(screen.getByText('2')).toBeInTheDocument();
//     expect(screen.getByText('5')).toBeInTheDocument();
//     expect(screen.getByText('1')).toBeInTheDocument();
//
//     // back to dashboard button/link
//     expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument();
//   });
//
//   it('shows error when fetch fails', async () => {
//     mockedGet.mockRejectedValueOnce(new Error('network failure'));
//
//     render(
//       <MemoryRouter>
//         <VendorCartAggregationManagement />
//       </MemoryRouter>
//     );
//
//     // loading shows up first
//     expect(screen.getByText(/Loading/i)).toBeInTheDocument();
//
//     // then error alert
//     expect(
//       await screen.findByRole('alert')
//     ).toHaveTextContent('Failed to fetch aggregated cart data.');
//   });
// });

// src/tests/VendorCartAggregationManagement.test.tsx
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import VendorCartAggregationManagement from '../pages/vendor/VendorCartAggregationManagement';
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

describe('<VendorCartAggregationManagement />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading then renders aggregated data', async () => {
    const payload = [
      {
        product__id: 1,
        product__name: 'Widget',
        total_quantity: 10,
        item_count: 2,
      },
      {
        product__id: 2,
        product__name: 'Gadget',
        total_quantity: 5,
        item_count: 1,
      },
    ];
    mockedGet.mockResolvedValueOnce({ data: payload });

    render(
      <MemoryRouter>
        <VendorCartAggregationManagement />
      </MemoryRouter>
    );

    // initial loading indicator
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    // verify the GET call
    await waitFor(() =>
      expect(mockedGet).toHaveBeenCalledWith('vendor/dashboard/cart/aggregation/')
    );

    // after fetch, heading appears
    expect(
      await screen.findByRole('heading', { level: 2, name: /Aggregated Cart Data/i })
    ).toBeInTheDocument();

    // grab all rows
    const allRows = screen.getAllByRole('row');
    // find the Widget row
    const widgetRow = allRows.find(
      (r) =>
        within(r).queryByText('Widget') &&
        within(r).queryByText('10') &&
        within(r).queryByText('2')
    );
    expect(widgetRow).toBeDefined();
    expect(within(widgetRow!).getByText('Widget')).toBeInTheDocument();
    expect(within(widgetRow!).getByText('10')).toBeInTheDocument();
    expect(within(widgetRow!).getByText('2')).toBeInTheDocument();

    // find the Gadget row
    const gadgetRow = allRows.find(
      (r) =>
        within(r).queryByText('Gadget') &&
        within(r).queryByText('5') &&
        within(r).queryByText('1')
    );
    expect(gadgetRow).toBeDefined();
    expect(within(gadgetRow!).getByText('Gadget')).toBeInTheDocument();
    expect(within(gadgetRow!).getByText('5')).toBeInTheDocument();
    expect(within(gadgetRow!).getByText('1')).toBeInTheDocument();

    // back to dashboard button/link
    expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument();
  });

  it('shows error when fetch fails', async () => {
    mockedGet.mockRejectedValueOnce(new Error('network failure'));

    render(
      <MemoryRouter>
        <VendorCartAggregationManagement />
      </MemoryRouter>
    );

    // loading indicator appears first
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    // then error alert
    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent('Failed to fetch aggregated cart data.');
  });
});
