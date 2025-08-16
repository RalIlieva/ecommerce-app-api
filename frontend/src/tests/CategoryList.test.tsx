// src/tests/CategoryList.test.tsx
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import CategoryList from '../pages/CategoryList';

// --- Mock data fetcher ---
vi.mock('../api/categories', () => ({
  fetchCategories: vi.fn(),
}));
import { fetchCategories } from '../api/categories';
const mockedFetchCategories = fetchCategories as unknown as vi.Mock;

const renderPage = () =>
  render(
    <MemoryRouter>
      <CategoryList />
    </MemoryRouter>
  );

describe('<CategoryList />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading then renders categories from {results: [...]}, with working links', async () => {
    const payload = {
      results: [
        { uuid: 'c1', slug: 'electronics', name: 'Electronics' },
        { uuid: 'c2', slug: 'books', name: 'Books' },
      ],
    };
    mockedFetchCategories.mockResolvedValueOnce(payload);

    renderPage();

    // Loading spinner
    expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();

    // Fetched
    await waitFor(() => expect(mockedFetchCategories).toHaveBeenCalled());

    // Heading
    expect(await screen.findByRole('heading', { name: /All Categories/i })).toBeInTheDocument();

    // List and items
    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(2);

    // First item content + link
    expect(items[0]).toHaveTextContent('Electronics');
    const firstLink = within(items[0]).getByRole('link', { name: /View Products/i });
    expect(firstLink).toHaveAttribute('href', '/categories/electronics');

    // Second item
    expect(items[1]).toHaveTextContent('Books');
    const secondLink = within(items[1]).getByRole('link', { name: /View Products/i });
    expect(secondLink).toHaveAttribute('href', '/categories/books');

    // Spinner gone
    expect(screen.queryByText(/Loading\.\.\./i)).not.toBeInTheDocument();
  });

  it('accepts a plain array response (no results key)', async () => {
    const payload = [
      { uuid: 'c3', slug: 'fashion', name: 'Fashion' },
      { uuid: 'c4', slug: 'gaming', name: 'Gaming' },
      { uuid: 'c5', slug: 'home', name: 'Home' },
    ];
    mockedFetchCategories.mockResolvedValueOnce(payload);

    renderPage();

    await waitFor(() => expect(mockedFetchCategories).toHaveBeenCalled());

    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(3);

    expect(items[0]).toHaveTextContent('Fashion');
    expect(within(items[0]).getByRole('link', { name: /View Products/i }))
      .toHaveAttribute('href', '/categories/fashion');

    expect(items[1]).toHaveTextContent('Gaming');
    expect(within(items[1]).getByRole('link', { name: /View Products/i }))
      .toHaveAttribute('href', '/categories/gaming');

    expect(items[2]).toHaveTextContent('Home');
    expect(within(items[2]).getByRole('link', { name: /View Products/i }))
      .toHaveAttribute('href', '/categories/home');
  });

  it('shows error message when fetch fails', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedFetchCategories.mockRejectedValueOnce(new Error('boom'));

    renderPage();

    expect(
      await screen.findByText(/Failed to fetch categories\./i)
    ).toBeInTheDocument();

    // Spinner gone
    expect(screen.queryByText(/Loading\.\.\./i)).not.toBeInTheDocument();

    spy.mockRestore();
  });
});
