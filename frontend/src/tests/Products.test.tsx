// src/tests/Products.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import Products from '../pages/Products';

// --- Mock data fetchers ---
vi.mock('../api/products', () => ({
  fetchProducts: vi.fn(),
}));
vi.mock('../api/categories', () => ({
  fetchCategories: vi.fn(),
}));
vi.mock('../api/tags', () => ({
  fetchTags: vi.fn(),
}));

import { fetchProducts } from '../api/products';
import { fetchCategories } from '../api/categories';
import { fetchTags } from '../api/tags';

// --- Mock child components to keep tests focused on page behavior ---
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
const mockedFetchCategories = fetchCategories as unknown as vi.Mock;
const mockedFetchTags = fetchTags as unknown as vi.Mock;

describe('<Products />', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockedFetchCategories.mockResolvedValue([
      { uuid: 'c1', slug: 'electronics', name: 'Electronics' },
      { uuid: 'c2', slug: 'books', name: 'Books' },
    ]);

    mockedFetchTags.mockResolvedValue([
      { id: 10, name: 'Sale' },
      { id: 20, name: 'New' },
    ]);
  });

  const renderAt = (path = '/products') =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <Products />
      </MemoryRouter>
    );

  it('shows loading then renders products, filters, and pagination; respects ?search= → apiParams.name', async () => {
    mockedFetchProducts.mockResolvedValueOnce({
      results: [
        { id: 1, name: 'Phone' },
        { id: 2, name: 'Laptop' },
      ],
      total_pages: 3,
      current_page: 1,
    });

    renderAt('/products?search=Phone');

    // Loading spinner text
    expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();

    // Called with proper params (note "name", not "search")
    await waitFor(() =>
      expect(mockedFetchProducts).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, page_size: 6, name: 'Phone' })
      )
    );

    // Heading
    expect(await screen.findByRole('heading', { name: /Products/i })).toBeInTheDocument();

    // ProductGrid shows items
    const grid = screen.getByTestId('product-grid');
    expect(within(grid).getByText('Phone')).toBeInTheDocument();
    expect(within(grid).getByText('Laptop')).toBeInTheDocument();

    // Category + Tag options rendered
    expect(screen.getByRole('option', { name: '-- Filter by Category --' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Electronics' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Books' })).toBeInTheDocument();

    expect(screen.getByRole('option', { name: '-- Filter by Tag --' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Sale' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'New' })).toBeInTheDocument();

    // Pagination mock shows page info
    expect(screen.getByTestId('pagination')).toHaveTextContent('Page 1 of 3');
  });

  it('changing filters triggers a new fetch with correct params and resets to page 1', async () => {
    mockedFetchProducts
      .mockResolvedValueOnce({
        // initial load
        results: [{ id: 1, name: 'Item A' }],
        total_pages: 5,
        current_page: 1,
      })
      .mockResolvedValueOnce({
        // after category change
        results: [{ id: 2, name: 'Item B (Electronics)' }],
        total_pages: 5,
        current_page: 1,
      })
      .mockResolvedValueOnce({
        // after min price change
        results: [{ id: 3, name: 'Item C (>=100)' }],
        total_pages: 5,
        current_page: 1,
      });

    renderAt();

    // Wait initial call
    await waitFor(() => expect(mockedFetchProducts).toHaveBeenCalledTimes(1));

    // Change category (first select)
    const [categorySelect] = screen.getAllByRole('combobox');
    fireEvent.change(categorySelect, { target: { value: 'electronics' } });

    await waitFor(() =>
      // last call should include category and page reset to 1
      expect(mockedFetchProducts).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, page_siz_
