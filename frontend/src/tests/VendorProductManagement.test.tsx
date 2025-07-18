// src/tests/VendorProductManagement.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { vi } from 'vitest';
import VendorProductManagement from '../pages/vendor/VendorProductManagement';
import api from '../api';
import { MemoryRouter } from 'react-router-dom';

/* react-bootstrap mock ---------------------------------------------------- */
vi.mock('react-bootstrap', () => {
  const Container = ({ children }: any) => <div>{children}</div>;
  const Row = ({ children }: any) => <div>{children}</div>;
  const Col = ({ children }: any) => <div>{children}</div>;

  const CardRoot = ({ children }: any) => <div>{children}</div>;
  const CardBody = ({ children }: any) => <div>{children}</div>;
  const CardTitle = ({ children }: any) => <h5>{children}</h5>;
  const CardText = ({ children }: any) => <p>{children}</p>;
  (CardRoot as any).Body = CardBody;
  (CardRoot as any).Title = CardTitle;
  (CardRoot as any).Text = CardText;

  const Button = ({ children, ...rest }: any) => <button {...rest}>{children}</button>;

  const Alert = ({ children, variant }: any) => (
    <div role={variant === 'danger' ? 'alert' : undefined}>{children}</div>
  );

  const ModalRoot = ({ children }: any) => <div>{children}</div>;
  const ModalHeader = ({ children }: any) => <div>{children}</div>;
  const ModalBody = ({ children }: any) => <div>{children}</div>;
  const ModalFooter = ({ children }: any) => <div>{children}</div>;
  const ModalTitle = ({ children }: any) => <h2>{children}</h2>;
  (ModalRoot as any).Header = ModalHeader;
  (ModalRoot as any).Body = ModalBody;
  (ModalRoot as any).Footer = ModalFooter;
  (ModalRoot as any).Title = ModalTitle;

  const Form: any = {
    Control: (props: any) => <input {...props} />,
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

/* Child component mocks --------------------------------------------------- */
vi.mock('../components/ProductForm', () => ({
  __esModule: true,
  default: ({ submitLabel = 'Submit', onSubmit }: any) => (
    <div data-testid="product-form">
      <button
        type="button"
        onClick={() =>
          onSubmit?.({
            name: 'NewProd',
            description: 'New description',
            price: 1,
            stock: 1,
            category: { name: 'Cat1', slug: 'cat1' },
            tags: [],
          })
        }
      >
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

/* API mock ---------------------------------------------------------------- */
vi.mock('../api');
const mockedGet = api.get as unknown as vi.Mock;
const mockedPost = api.post as unknown as vi.Mock;
const mockedPut = api.put as unknown as vi.Mock;
const mockedDelete = api.delete as unknown as vi.Mock;

/* Render helper ------------------------------------------------------------ */
const renderPage = () =>
  render(
    <MemoryRouter>
      <VendorProductManagement />
    </MemoryRouter>
  );

/* Tests ------------------------------------------------------------------- */
describe('VendorProductManagement', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('fetches and displays products, categories, and tags, and handles add product success', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { results: [{ uuid: 'c1', name: 'Cat1', slug: 'cat1' }] },
    }); // categories
    mockedGet.mockResolvedValueOnce({
      data: { results: [{ id: 't1', name: 'Tag1', slug: 'tag1' }] },
    }); // tags
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
    }); // products

    renderPage();

    expect(screen.getByText('Vendor Product Management')).toBeTruthy();
    expect(await screen.findByText('Prod1')).toBeTruthy();

    mockedPost.mockResolvedValueOnce({});
    mockedGet.mockResolvedValueOnce({
      data: { results: [], current_page: 1, total_pages: 1 },
    }); // refetch after add

    const form = screen.getByTestId('product-form');
    const addBtn = within(form).getByRole('button', { name: /Add Product/i });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText('Product added successfully.')).toBeTruthy();
    });
  });

  it('handles fetch products failure', async () => {
    mockedGet.mockResolvedValueOnce({ data: { results: [] } }); // categories
    mockedGet.mockResolvedValueOnce({ data: { results: [] } }); // tags
    mockedGet.mockRejectedValueOnce(new Error('fail')); // products

    renderPage();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Failed to fetch products.');
  });
});



