// src/tests/TagList.test.tsx
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import TagList from '../pages/TagList';

// --- Mock data fetcher ---
vi.mock('../api/tags', () => ({
  fetchTags: vi.fn(),
}));
import { fetchTags } from '../api/tags';
const mockedFetchTags = fetchTags as unknown as vi.Mock;

const renderPage = () =>
  render(
    <MemoryRouter>
      <TagList />
    </MemoryRouter>
  );

describe('<TagList />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading then renders tags from {results: [...]}', async () => {
    const payload = {
      results: [
        { uuid: 't1', name: 'Sale' },
        { uuid: 't2', name: 'New' },
        { uuid: 't3', name: 'Popular' },
      ],
    };
    mockedFetchTags.mockResolvedValueOnce(payload);

    renderPage();

    // Loading spinner
    expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();

    // Fetched
    await waitFor(() => expect(mockedFetchTags).toHaveBeenCalled());

    // Heading
    expect(await screen.findByRole('heading', { name: /All Tags/i })).toBeInTheDocument();

    // List and items
    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(3);

    // Names
    expect(items[0]).toHaveTextContent('Sale');
    expect(items[1]).toHaveTextContent('New');
    expect(items[2]).toHaveTextContent('Popular');

    // Spinner gone
    expect(screen.queryByText(/Loading\.\.\./i)).not.toBeInTheDocument();
  });

  it('accepts a plain array response (no results key)', async () => {
    const payload = [
      { uuid: 't10', name: 'Clearance' },
      { uuid: 't20', name: 'Limited' },
    ];
    mockedFetchTags.mockResolvedValueOnce(payload);

    renderPage();

    await waitFor(() => expect(mockedFetchTags).toHaveBeenCalled());

    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(2);

    expect(items[0]).toHaveTextContent('Clearance');
    expect(items[1]).toHaveTextContent('Limited');
  });

  it('shows error message when fetch fails', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedFetchTags.mockRejectedValueOnce(new Error('boom'));

    renderPage();

    expect(await screen.findByText(/Failed to fetch tags\./i)).toBeInTheDocument();

    // Spinner gone
    expect(screen.queryByText(/Loading\.\.\./i)).not.toBeInTheDocument();

    spy.mockRestore();
  });
});
