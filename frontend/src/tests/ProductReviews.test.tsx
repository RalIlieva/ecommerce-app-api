// src/tests/ProductReviews.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import ProductReviews from '../pages/ProductReviews';
import AuthContext from '../context/AuthContext';

// ---- Mock api module (get/post/put/delete) ----
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));
import api from '../api';

// ---- Keep utils simple: renderStars returns a string marker ----
vi.mock('../utils', () => ({
  renderStars: (n: number) => `RATING:${n}`,
}));

const mockedGet = api.get as unknown as vi.Mock;
const mockedPost = api.post as unknown as vi.Mock;
const mockedPut = api.put as unknown as vi.Mock;
const mockedDelete = api.delete as unknown as vi.Mock;

const productUuid = 'p-uuid';
const productSlug = 'prod-slug';

const ownerProfileUuid = 'prof-1';
const otherProfileUuid = 'prof-2';

const baseReview = {
  created: '2025-08-01T00:00:00Z',
  modified: '2025-08-01T00:00:00Z',
};

const reviewsInitial = [
  {
    uuid: 'r1',
    user: { uuid: ownerProfileUuid, name: 'You' },
    rating: 4,
    comment: 'Owner review',
    ...baseReview,
  },
  {
    uuid: 'r2',
    user: { uuid: otherProfileUuid, name: 'Alice' },
    rating: 5,
    comment: 'Great!',
    created: '2025-07-15T00:00:00Z',
    modified: '2025-07-20T00:00:00Z', // edited
  },
];

const renderWithProviders = ({
  user,
  isAuthenticated,
}: {
  user: any;
  isAuthenticated: boolean;
}) =>
  render(
    <AuthContext.Provider value={{ user } as any}>
      <MemoryRouter>
        <ProductReviews
          productUuid={productUuid}
          productSlug={productSlug}
          isAuthenticated={isAuthenticated}
        />
      </MemoryRouter>
    </AuthContext.Provider>
  );

beforeEach(() => {
  vi.resetAllMocks();
});

describe('<ProductReviews />', () => {
  it('fetches and shows empty state', async () => {
    mockedGet.mockResolvedValueOnce({ data: { results: [] } });

    renderWithProviders({ user: null, isAuthenticated: false });

    await waitFor(() =>
      expect(mockedGet).toHaveBeenCalledWith(
        `/products/products/${productUuid}/${productSlug}/reviews/`
      )
    );

    expect(
      await screen.findByText(/No reviews yet\. Be the first to leave one!/i)
    ).toBeInTheDocument();

    // Non-authenticated users see a login prompt link
    expect(screen.getByRole('link', { name: /Log in/i })).toHaveAttribute('href', '/login');
  });

  it('renders reviews with rating markers and edited date note, and owner sees Edit/Delete', async () => {
    mockedGet.mockResolvedValueOnce({ data: { results: reviewsInitial } });

    renderWithProviders({
      user: { profile_uuid: ownerProfileUuid },
      isAuthenticated: true,
    });

    // Both reviews present
    expect(await screen.findByText('Owner review')).toBeInTheDocument();
    expect(screen.getByText('Great!')).toBeInTheDocument();

    // Our simple renderStars mock output
    expect(screen.getAllByText(/RATING:/)).toHaveLength(2);

    // Edited indicator for the second review (modified !== created)
    expect(screen.getByText(/\(Edited on /)).toBeInTheDocument();

    // Owner controls visible on owner's review
    const ownerItem = screen.getByText('Owner review').closest('li')!;
    expect(within(ownerItem).getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    expect(within(ownerItem).getByRole('button', { name: /Delete/i })).toBeInTheDocument();

    // No edit/delete on non-owner’s review
    const otherItem = screen.getByText('Great!').closest('li')!;
    expect(within(otherItem).queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument();
    expect(within(otherItem).queryByRole('button', { name: /Delete/i })).not.toBeInTheDocument();
  });

  it('submits a new review successfully, resets form, and reloads list', async () => {
    // initial load
    mockedGet.mockResolvedValueOnce({ data: { results: [] } });
    // reload after submit
    mockedGet.mockResolvedValueOnce({ data: { results: reviewsInitial } });
    mockedPost.mockResolvedValueOnce({ data: { ok: true } });

    renderWithProviders({
      user: { profile_uuid: ownerProfileUuid },
      isAuthenticated: true,
    });

    // Fill out form
    fireEvent.change(screen.getByLabelText(/Rating \(1-5\)/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/^Comment$/i), {
      target: { value: 'Amazing product' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Submit Review/i }));

    // POST payload and endpoint
    await waitFor(() =>
      expect(mockedPost).toHaveBeenCalledWith(
        `/products/products/${productUuid}/${productSlug}/reviews/create/`,
        { rating: 5, comment: 'Amazing product' }
      )
    );

    // Success message and form reset
    expect(await screen.findByText(/Review submitted!/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rating \(1-5\)/i)).toHaveValue('0');
//     expect(screen.getByLabelText(/Rating \(1-5\)/i)).toHaveValue(0);
    expect(screen.getByLabelText(/^Comment$/i)).toHaveValue('');

    // Reloaded list present
    expect(await screen.findByText('Owner review')).toBeInTheDocument();
  });

  it('validates new review form (rating/comment required)', async () => {
    mockedGet.mockResolvedValueOnce({ data: { results: [] } });

    renderWithProviders({
      user: { profile_uuid: ownerProfileUuid },
      isAuthenticated: true,
    });

    // Only fill comment; leave rating = 0
    fireEvent.change(screen.getByLabelText(/^Comment$/i), {
      target: { value: 'text only' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Submit Review/i }));

    expect(
      await screen.findByText(/Please provide both a rating and a comment\./i)
    ).toBeInTheDocument();
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it('shows specific 400 error when already reviewed', async () => {
    mockedGet.mockResolvedValueOnce({ data: { results: [] } });
    mockedPost.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          detail: {
            non_field_errors: ['You have already reviewed this product.'],
          },
        },
      },
    });

    renderWithProviders({
      user: { profile_uuid: ownerProfileUuid },
      isAuthenticated: true,
    });

    fireEvent.change(screen.getByLabelText(/Rating \(1-5\)/i), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText(/^Comment$/i), { target: { value: 'nice' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit Review/i }));

    expect(
      await screen.findByText(/You have already reviewed this product\./i)
    ).toBeInTheDocument();
  });

  it('can edit own review and reloads list', async () => {
    // Initial load returns existing reviews
    mockedGet.mockResolvedValueOnce({ data: { results: reviewsInitial } });
    // Reload after edit returns updated comment
    const updated = [
      { ...reviewsInitial[0], comment: 'Updated comment', rating: 5 },
      reviewsInitial[1],
    ];
    mockedGet.mockResolvedValueOnce({ data: { results: updated } });
    mockedPut.mockResolvedValueOnce({ data: { ok: true } });

    renderWithProviders({
      user: { profile_uuid: ownerProfileUuid },
      isAuthenticated: true,
    });

    // Open edit on owner review
    const ownerItem = await screen.findByText('Owner review');
    const li = ownerItem.closest('li')!;
    fireEvent.click(within(li).getByRole('button', { name: /Edit/i }));

    // Fill edit form
    const editForm = li.querySelector('form') as HTMLFormElement;
    expect(editForm).toBeInTheDocument();

    fireEvent.change(within(editForm).getByRole('combobox', { name: /Rating/i }), {
      target: { value: '5' },
    });
    fireEvent.change(within(editForm).getByRole('textbox', { name: /Comment/i }), {
      target: { value: 'Updated comment' },
    });

    fireEvent.click(within(editForm).getByRole('button', { name: /Save/i }));

    // PUT call
    await waitFor(() =>
      expect(mockedPut).toHaveBeenCalledWith(
        `/products/products/${productUuid}/${productSlug}/reviews/r1/`,
        { rating: 5, comment: 'Updated comment' }
      )
    );

    // After reload, updated text is shown
    expect(await screen.findByText('Updated comment')).toBeInTheDocument();
  });

  it('can delete own review and removes it from the list without refetch', async () => {
    mockedGet.mockResolvedValueOnce({ data: { results: reviewsInitial } });
    mockedDelete.mockResolvedValueOnce({ data: { ok: true } });

    renderWithProviders({
      user: { profile_uuid: ownerProfileUuid },
      isAuthenticated: true,
    });

    const ownerItem = await screen.findByText('Owner review');
    const li = ownerItem.closest('li')!;
    fireEvent.click(within(li).getByRole('button', { name: /Delete/i }));

    await waitFor(() =>
      expect(mockedDelete).toHaveBeenCalledWith(
        `/products/products/${productUuid}/${productSlug}/reviews/r1/`
      )
    );

    // Owner review disappears
    await waitFor(() =>
      expect(screen.queryByText('Owner review')).not.toBeInTheDocument()
    );
  });

  it('shows error when initial fetch fails', async () => {
    mockedGet.mockRejectedValueOnce(new Error('fail'));
    renderWithProviders({ user: null, isAuthenticated: false });

    expect(await screen.findByText(/Failed to load reviews\./i)).toBeInTheDocument();
  });
});
