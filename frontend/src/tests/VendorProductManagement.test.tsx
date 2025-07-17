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

/*
  react-bootstrap mock -------------------------------------------------------
  We provide minimal functional stand-ins for just the pieces used by the
  component under test.  Anything we don't need we leave out so that we don't
  accidentally create invalid React elements (which would trigger the
  "Element type is invalid" runtime error we saw earlier).
*/
vi.mock('react-bootstrap', () => {
  const Container = ({ children }: any) => <div>{children}</div>;
  const Row = ({ children }: any) => <div>{children}</div>;
  const Col = ({ children }: any) => <div>{children}</div>;

  // Minimal Card implementation with static subcomponents.
  const CardRoot = ({ children }: any) => <div>{children}</div>;
  const CardBody = ({ children }: any) => <div>{children}</div>;
  const CardTitle = ({ children }: any) => <h5>{children}</h5>;
  const CardText = ({ children }: any) => <p>{children}</p>;
  (CardRoot as any).Body = CardBody;
  (CardRoot as any).Title = CardTitle;
  (CardRoot as any).Text = CardText;

  const Button = ({ children, ...rest }: any) => <button {...rest}>{children}</button>;

  // Alert: give role="alert" when variant="danger" so we can query in tests.
  const Alert = ({ children, variant }: any) => (
    <div role={variant === 'danger' ? 'alert' : undefined}>{children}</div>
  );

  // Modal + subparts
  const ModalRoot = ({ children }: any) => <div>{children}</div>;
  const ModalHeader = ({ children }: any) => <div>{children}</div>;
  const ModalBody = ({ children }: any) => <div>{children}</div>;
  const ModalFooter = ({ children }: any) => <div>{children}</div>;
  const ModalTitle = ({ children }: any) => <h2>{children}</h2>;
  (ModalRoot as any).Header = ModalHeader;
  (ModalRoot as any).Body = ModalBody;
  (ModalRoot as any).Footer = ModalFooter;
  (ModalRoot as any).Title = ModalTitle;

  // Form bits we actually touch in the component (Control & Select)
  const Form: any = {
    Control: ({ children, ...rest }: any) => <input {...rest} />,
    Select: ({ children, ...rest }: any) => <select {...rest}>{children}</select>,
  };

  return {
    Container,
    Row,
    Col,
    Card: CardRoot,
    Button,
    Alert,
    Modal: ModalRoot,
    Form,
  };
});

/*
  Child component mocks ------------------------------------------------------
  We keep these *interactive* enough that the parent component logic runs.  In
  particular, the ProductForm mock renders a button with the supplied
  `submitLabel` prop so we can click it to trigger `onSubmit`.
*/
vi.mock('../components/ProductForm', () => ({
  __esModule: true,
  default: ({ submitLabel = 'Submit', onSubmit }: any) => (
    <div data-testid="product-form">
      <button onClick={() => onSubmit?.({
        name: 'NewProd',
        description: 'New description',
        price: 1,
        stock: 1,
        category: { name: 'Cat1', slug: 'cat1' },
        tags: [],
      })}>
        {submitLabel}
      </button>
    </div>
  ),
}));

vi.mock('../components/ProductImageManager', () => ({
  __esModule: true,
  default: () => <div data-testid="image-manager" />,
}));

vi.mock('../components/Pagination', () => ({
  __esModule: true,
  default: ({ currentPage, totalPages, onPageChange }: any) => (
    <div>
      <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        Prev
      </button>
      <span>
        Page {currentPage} / {totalPages}
      </span>
      <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
        Next
      </button>
    </div>
  ),
}));

/*
  API mock ------------------------------------------------------------------
*/
vi.mock('../api');
const mockedGet = api.get as unknown as vi.Mock;
const mockedPost = api.post as unknown as vi.Mock;
const mockedPut = api.put as unknown as vi.Mock;
const mockedDelete = api.delete as unknown as vi.Mock;

// Utility render helper -----------------------------------------------------
const renderPage = () =>
  render(
    <MemoryRouter>
      <VendorProductManagement />
    </MemoryRouter>
  );

// ---------------------------------------------------------------------------
describe('VendorProductManagement', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('fetches and displays products, categories, and tags, and handles add product success', async () => {
    // categories
    mockedGet.mockResolvedValueOnce({ data: { results: [{ uuid: 'c1', name: 'Cat1', slug: 'cat1' }] } });
    // tags
    mockedGet.mockResolvedValueOnce({ data: { results: [{ id: 't1', name: 'Tag1', slug: 'tag1' }] } });
    // products list
    mockedGet.mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 'p1',
            name: 'Prod1',
            price: 10,
            stock: 5,
            category: { name: 'Cat1' },
            description: 'Desc1',
            uuid: 'p1',
            slug: 's1',
          },
        ],
        current_page: 1,
        total_pages: 1,
      },
    });

    renderPage();

    // initial heading always there synchronously; product list async.
    expect(screen.getByText('Vendor Product Management')).toBeTruthy();
    expect(await screen.findByText('Prod1')).toBeTruthy();

    // Simulate successful add (ProductForm mock calls onSubmit with payload)
    mockedPost.mockResolvedValueOnce({});
    // after add, component refetches products (we'll return an empty list)
    mockedGet.mockResolvedValueOnce({
      data: { results: [], current_page: 1, total_pages: 1 },
    });

    fireEvent.click(screen.getByRole('button', { name: /Add Product/i }));

    // success message appears
    await waitFor(() => {
      expect(screen.getByText('Product added successfully.')).toBeTruthy();
    });
  });

  it('handles fetch products failure', async () => {
    // categories & tags succeed (empty)
    mockedGet.mockResolvedValueOnce({ data: { results: [] } });
    mockedGet.mockResolvedValueOnce({ data: { results: [] } });
    // products error
    mockedGet.mockRejectedValueOnce(new Error('fail'));

    renderPage();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Failed to fetch products.');
  });
});

