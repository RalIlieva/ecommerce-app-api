// // src/tests/VendorProductManagement.test.tsx
// import React from 'react';
// import { render, screen, waitFor, fireEvent } from '@testing-library/react';
// import { vi } from 'vitest';
// import VendorProductManagement from '../pages/vendor/VendorProductManagement';
// import api from '../api';
// import { MemoryRouter } from 'react-router-dom';
//
// // Mock react-bootstrap components
// vi.mock('react-bootstrap', () => {
//   const Container = ({ children }: any) => <div>{children}</div>;
//   const Row = ({ children }: any) => <div>{children}</div>;
//   const Col = ({ children }: any) => <div>{children}</div>;
//   const Card = ({ children }: any) => <div>{children}</div>;
//   const Button = (props: any) => <button {...props}>{props.children}</button>;
//   const Alert = (props: any) => (
//     <div role={props.variant === 'danger' ? 'alert' : undefined}>
//       {props.children}
//     </div>
//   );
//   const Modal = ({ children }: any) => <div>{children}</div>;
//   Modal.Header = ({ children }: any) => <div>{children}</div>;
//   Modal.Body = ({ children }: any) => <div>{children}</div>;
//   Modal.Title = ({ children }: any) => <h2>{children}</h2>;
//   const Form = {
//     Control: (props: any) => <input {...props} />,
//     Select: (props: any) => <select {...props}>{props.children}</select>,
//   };
//   return { Container, Row, Col, Card, Button, Alert, Modal, Form };
// });
//
// // Mock child components
// vi.mock('../components/ProductForm', () => ({ __esModule: true, default: () => <div data-testid="product-form"/> }));
// vi.mock('../components/ProductImageManager', () => ({ __esModule: true, default: () => <div data-testid="image-manager"/> }));
// vi.mock('../components/Pagination', () => ({ __esModule: true, default: ({ currentPage, totalPages, onPageChange }: any) => (
//   <div>
//     <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>Prev</button>
//     <span>Page {currentPage} / {totalPages}</span>
//     <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Next</button>
//   </div>
// )}));
//
// // Mock API
// vi.mock('../api');
// const mockedGet = api.get as vi.Mock;
// const mockedPost = api.post as vi.Mock;
//
// describe('VendorProductManagement', () => {
//   beforeEach(() => {
//     vi.resetAllMocks();
//   });
//
//   it('fetches and displays products, categories, and tags, and handles add product success', async () => {
//     // Stub categories
//     mockedGet.mockResolvedValueOnce({ data: { results: [{ uuid: 'c1', name: 'Cat1', slug: 'cat1' }] } });
//     // Stub tags
//     mockedGet.mockResolvedValueOnce({ data: { results: [{ id: 't1', name: 'Tag1', slug: 'tag1' }] } });
//     // Stub products list
//     mockedGet.mockResolvedValueOnce({ data: { results: [
//       { id: 'p1', name: 'Prod1', price: 10, stock: 5, category: { name: 'Cat1' }, description: 'Desc1', uuid: 'p1', slug: 's1' }
//     ], current_page: 1, total_pages: 1 } });
//
//     render(
//       <MemoryRouter>
//         <VendorProductManagement />
//       </MemoryRouter>
//     );
//
//     // Header and product row should appear
//     expect(await screen.findByText('Vendor Product Management')).toBeTruthy();
//     expect(await screen.findByText('Prod1')).toBeTruthy();
//
//     // Simulate adding a product
//     mockedPost.mockResolvedValueOnce({});
//     // After post, fetchProducts is called again
//     mockedGet.mockResolvedValueOnce({ data: { results: [], current_page: 1, total_pages: 1 } });
//     fireEvent.click(screen.getByText('Add Product'));
//
//     // Success alert
//     await waitFor(() => {
//       expect(screen.getByText('Product added successfully.')).toBeTruthy();
//     });
//   });
//
//   it('handles fetch products failure', async () => {
//     // categories & tags OK
//     mockedGet.mockResolvedValueOnce({ data: { results: [] } });
//     mockedGet.mockResolvedValueOnce({ data: { results: [] } });
//     // products fail
//     mockedGet.mockRejectedValueOnce(new Error('fetch-fail'));
//
//     render(
//       <MemoryRouter>
//         <VendorProductManagement />
//       </MemoryRouter>
//     );
//
//     const alert = await screen.findByRole('alert');
//     expect(alert.textContent).toContain('Failed to fetch products.');
//   });
// });

// src/tests/VendorProductManagement.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import VendorProductManagement from '../pages/vendor/VendorProductManagement';
import api from '../api';
import { MemoryRouter } from 'react-router-dom';

// Mock react-bootstrap components
vi.mock('react-bootstrap', () => {
  const Container = ({ children }: any) => <div>{children}</div>;
  const Row = ({ children }: any) => <div>{children}</div>;
  const Col = ({ children }: any) => <div>{children}</div>;
  const Card = ({ children }: any) => <div>{children}</div>;
  const Button = (props: any) => <button {...props}>{props.children}</button>;
  const Alert = (props: any) => <div role={props.variant === 'danger' ? 'alert' : undefined}>{props.children}</div>;
  const Modal = ({ children }: any) => <div>{children}</div>;
  Modal.Header = ({ children }: any) => <div>{children}</div>;
  Modal.Body = ({ children }: any) => <div>{children}</div>;
  Modal.Title = ({ children }: any) => <h2>{children}</h2>;
  const Form = {
    Control: (props: any) => <input {...props} />,
    Select: (props: any) => <select {...props}>{props.children}</select>
  };
  return { Container, Row, Col, Card, Button, Alert, Modal, Form };
});

// Mock child components
vi.mock('../components/ProductForm', () => ({ __esModule: true, default: () => <div data-testid="product-form"/> }));
vi.mock('../components/ProductImageManager', () => ({ __esModule: true, default: () => <div data-testid="image-manager"/> }));
vi.mock('../components/Pagination', () => ({ __esModule: true, default: ({ currentPage, totalPages, onPageChange }: any) => (
  <div>
    <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>Prev</button>
    <span>Page {currentPage} / {totalPages}</span>
    <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Next</button>
  </div>
) }));

// Mock api
vi.mock('../api');
const mockedGet = api.get as vi.Mock;
const mockedPost = api.post as vi.Mock;
const mockedPut = api.put as vi.Mock;
const mockedDelete = api.delete as vi.Mock;

describe('VendorProductManagement', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('fetches and displays products, categories, and tags, and handles add product success', async () => {
    // stub categories & tags
    mockedGet.mockResolvedValueOnce({ data: { results: [{ uuid: 'c1', name: 'Cat1', slug: 'cat1' }] } });
    mockedGet.mockResolvedValueOnce({ data: { results: [{ id: 't1', name: 'Tag1', slug: 'tag1' }] } });
    // stub products list
    mockedGet.mockResolvedValueOnce({ data: { results: [{ id: 'p1', name: 'Prod1', price: 10, stock: 5, category: { name: 'Cat1' }, description: 'Desc1', uuid: 'p1', slug: 's1' }], current_page: 1, total_pages: 1 } });

    render(
      <MemoryRouter>
        <VendorProductManagement />
      </MemoryRouter>
    );

    // Wait for initial load
    expect(await screen.findByText('Vendor Product Management')).toBeTruthy();
    expect(await screen.findByText('Prod1')).toBeTruthy();

    // Simulate add product
    mockedPost.mockResolvedValueOnce({});
    mockedGet.mockResolvedValueOnce({ data: { results: [], current_page: 1, total_pages: 1 } });
    fireEvent.click(screen.getByText('Add Product'));

    // Success message
    await waitFor(() => {
      expect(screen.getByText('Product added successfully.')).toBeTruthy();
    });
  });

  it('handles fetch products failure', async () => {
    // categories & tags success
    mockedGet.mockResolvedValueOnce({ data: { results: [] } });
    mockedGet.mockResolvedValueOnce({ data: { results: [] } });
    // products failure
    mockedGet.mockRejectedValueOnce(new Error('fail'));

    render(
      <MemoryRouter>
        <VendorProductManagement />
      </MemoryRouter>
    );

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Failed to fetch products.');
  });
});
