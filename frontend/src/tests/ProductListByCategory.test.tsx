// src/tests/ProductListByCategory.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import ProductListByCategory from '../pages/ProductListByCategory';

// ---- Mock router params ----
const mockedParams = { slug: 'electronics' };
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => mockedParams,
  };
});

// ---- Mock data fetchers ----
vi.mock('../api/products', () => ({
  fetchProducts: vi.fn(),
}));
vi.mock('../api/categories', () => ({
  fetchCategoryDetail: vi.fn(),
}));

import { fetchProducts } from '../api/products';
import { fetchCategoryDetail } from '../api/categories';

// ---- Mock child components ----
vi.mock('../components/ProductGrid', () => ({
  default: ({ products }: any) => (
    <div data-testid="product-grid">
      {products?.map((p: any) => (
        <div key={p.id} className="product-row">
          {p.name}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../components/Pagination', () => ({
  default: ({ currentPage, totalPages, onPageChange }: any) => (
    <div data-testid="pagination">
      <span>Page {currentPage} of {totalPages}</span>
      {currentPage > 1 && (
        <button onClick={() => onPageChange(currentPage - 1)}>Prev</button>
      )}
      {currentPage < totalPages && (
        <button onClick={() => onPageChange(currentPage + 1)}>Next</button>
      )}
    </div>
  ),
}));

const mockedFetchProducts = fetchProducts as unknown as vi.Mock;
const mockedFetchCategoryDetail = fetchCategoryDetail as unknown as vi.Mock;

const renderPage = () =>
  render(
    <MemoryRouter>
      <ProductListByCategory />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.resetAllMocks();
  mockedParams.slug = 'electronics';
});

describe('<ProductListByCategory />', () => {
  it('shows loading, then renders heading, grid and pagination with correct calls', async () => {
    mockedFetchCategoryDetail.mockResolvedValueOnce({
      uuid: 'c1',
      slug: 'electronics',
      name: 'Electronics',
    });

    mockedFetchProducts.mockResolvedValueOnce({
      results: [
        { id: 1, name: 'Phone' },
        { id: 2, name: 'Laptop' },
      ],
      total_pages: 3,
    });

    renderPage();

    // Loading indicator
    expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();

    // Category detail call
    await waitFor(() =>
      expect(mockedFetchCategoryDetail).toHaveBeenCalledWith('electronics')
    );

    // First product fetch call with pagination params
    await waitFor(() =>
      expect(mockedFetchProducts).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'electronics', page: 1, page_size: 6 })
      )
    );

    // Heading uses the category name
    expect(
      await screen.findByRole('heading', { name: /Products in "Electronics"/i })
    ).toBeInTheDocument();

    // Grid content
    const grid = screen.getByTestId('product-grid');
    expect(within(grid).getByText('Phone')).toBeInTheDocument();
    expect(within(grid).getByText('Laptop')).toBeInTheDocument();

    // Pagination content
    expect(screen.getByTestId('pagination')).toHaveTextContent('Page 1 of 3');

    // Back link
    const back = screen.getByRole('link', { name: /Back to Categories/i });
    expect(back).toHaveAttribute('href', '/categories');
  });

  it('shows empty-state message when no products returned', async () => {
    mockedFetchCategoryDetail.mockResolvedValueOnce({
      uuid: 'c1',
      slug: 'electronics',
      name: 'Electronics',
    });
    mockedFetchProducts.mockResolvedValueOnce({
      results: [],
      total_pages: 1,
    });

    renderPage();

    expect(
      await screen.findByText(/No products found in this category\./i)
    ).toBeInTheDocument();

    // Grid and pagination should not appear
    expect(screen.queryByTestId('product-grid')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });

  it('renders error state if fetching fails', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedFetchCategoryDetail.mockResolvedValueOnce({
      uuid: 'c1',
      slug: 'electronics',
      name: 'Electronics',
    });
    mockedFetchProducts.mockRejectedValueOnce(new Error('boom'));

    renderPage();

    expect(
      await screen.findByText(/Failed to fetch products for this category\./i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/Loading\.\.\./i)).not.toBeInTheDocument();

    spy.mockRestore();
  });

  it('renders "Category not found." when category detail is null', async () => {
    mockedFetchCategoryDetail.mockResolvedValueOnce(null);
    // Even if products are fetched, the UI should prioritize missing category
    mockedFetchProducts.mockResolvedValueOnce({
      results: [{ id: 1, name: 'Ghost' }],
      total_pages: 2,
    });

    renderPage();

    expect(await screen.findByText(/Category not found\./i)).toBeInTheDocument();

    // Should not show heading/grid/pagination
    expect(screen.queryByRole('heading', { name: /Products in/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('product-grid')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });

  it('supports pagination: clicking Next fetches next page with same category and page_size', async () => {
    mockedFetchCategoryDetail.mockResolvedValue({
      uuid: 'c1',
      slug: 'electronics',
      name: 'Electronics',
    });

    // Echo result for requested page
    mockedFetchProducts.mockImplementation(async (params: any) => {
      const page = params.page ?? 1;
      return {
        results: [{ id: page, name: `Item p${page}` }],
        total_pages: 3,
      };
    });

    renderPage();

    // Page 1 visible
    expect(await screen.findByText('Item p1')).toBeInTheDocument();
    expect(screen.getByTestId('pagination')).toHaveTextContent('Page 1 of 3');

    // Next
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    await waitFor(() =>
      expect(mockedFetchProducts).toHaveBeenLastCalledWith(
        expect.objectContaining({ category: 'electronics', page: 2, page_size: 6 })
      )
    );

    expect(await screen.findByText('Item p2')).toBeInTheDocument();
    expect(screen.getByTestId('pagination')).toHaveTextContent('Page 2 of 3');
  });
});
