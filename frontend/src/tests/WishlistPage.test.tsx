// src/tests/WishlistPage.test.tsx
import React from 'react';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import WishlistPage from '../pages/WishlistPage';
import AuthContext from '../context/AuthContext';

// ---- Mock wishlist API module ----
vi.mock('../api/wishlist', () => ({
  fetchWishlist: vi.fn(),
  removeFromWishlist: vi.fn(),
  moveWishlistItemToCart: vi.fn(),
}));
import {
  fetchWishlist,
  removeFromWishlist,
  moveWishlistItemToCart,
} from '../api/wishlist';

const mockedFetch = fetchWishlist as unknown as vi.Mock;
const mockedRemove = removeFromWishlist as unknown as vi.Mock;
const mockedMoveToCart = moveWishlistItemToCart as unknown as vi.Mock;

// ---- Mock api.get for cart refresh ----
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
  },
}));
import api from '../api';
const mockedApiGet = api.get as unknown as vi.Mock;

// ---- Mock WishlistContext & CartContext hooks ----
let wishlistCtx: { wishlistCount: number; setWishlistCount: vi.Mock };
vi.mock('../context/WishlistContext', () => ({
  useWishlistContext: () => wishlistCtx,
}));

let cartCtx: { cartCount: number; setCartCount: vi.Mock };
vi.mock('../context/CartContext', () => ({
  useCartContext: () => cartCtx,
}));

// ---- Helpers ----
const renderWithUser = (user: any) =>
  render(
    <AuthContext.Provider value={{ user } as any}>
      <MemoryRouter>
        <WishlistPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );

const makeWishlist = (items: Array<{ uuid: string; name: string; productUuid: string; image?: string | null }>) => ({
  items: items.map((it) => ({
    uuid: it.uuid,
    product: {
      uuid: it.productUuid,
      name: it.name,
      image: it.image ?? null,
    },
  })),
});

beforeEach(() => {
  vi.resetAllMocks();
  wishlistCtx = { wishlistCount: 0, setWishlistCount: vi.fn() };
  cartCtx = { cartCount: 0, setCartCount: vi.fn() };
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  (window.alert as any).mockRestore?.();
});

describe('<WishlistPage />', () => {
  it('unauthenticated: prompts to log in and resets wishlist count; no fetch call', async () => {
    renderWithUser(null);

    expect(
      await screen.findByText(/Please log in to view your wishlist\./i)
    ).toBeInTheDocument();

    // Reset global wishlist count
    await waitFor(() => expect(wishlistCtx.setWishlistCount).toHaveBeenCalledWith(0));
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('shows spinner then renders items and sets global count', async () => {
    const data = makeWishlist([
      { uuid: 'w1', productUuid: 'p1', name: 'Red Shoes', image: 'http://img/red.jpg' },
      { uuid: 'w2', productUuid: 'p2', name: 'Green Hat', image: null }, // no image
    ]);
    mockedFetch.mockResolvedValueOnce(data);

    renderWithUser({ uuid: 'u-1' });

    // Spinner
    expect(screen.getByText(/Loading wishlist\.\.\./i)).toBeInTheDocument();

    // After load
    expect(await screen.findByRole('heading', { name: /Your Wishlist/i })).toBeInTheDocument();

    // Two cards present
    const cards = screen.getAllByRole('img');
    expect(cards).toHaveLength(2);

    // Titles
    expect(screen.getByText('Red Shoes')).toBeInTheDocument();
    expect(screen.getByText('Green Hat')).toBeInTheDocument();

    // Global wishlist count set
    expect(wishlistCtx.setWishlistCount).toHaveBeenCalledWith(2);
  });

  it('shows placeholder image when product.image is missing', async () => {
    const data = makeWishlist([
      { uuid: 'w1', productUuid: 'p1', name: 'No Image Product', image: null },
    ]);
    mockedFetch.mockResolvedValueOnce(data);

    renderWithUser({ uuid: 'u-2' });

    await screen.findByText('No Image Product');
    const img = screen.getByAltText('No Image Product') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/placeholder.png');
  });

  it('shows error message when fetch fails', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedFetch.mockRejectedValueOnce(new Error('fail'));

    renderWithUser({ uuid: 'u-3' });

    expect(
      await screen.findByText(/Failed to fetch wishlist\./i)
    ).toBeInTheDocument();

    spy.mockRestore();
  });

  it('shows empty state when wishlist has no items', async () => {
    mockedFetch.mockResolvedValueOnce(makeWishlist([]));

    renderWithUser({ uuid: 'u-4' });

    expect(
      await screen.findByRole('heading', { name: /Your wishlist is empty/i })
    ).toBeInTheDocument();
  });

  it('Remove: success path refetches and updates count', async () => {
    // Initial fetch -> 2 items
    mockedFetch
      .mockResolvedValueOnce(
        makeWishlist([
          { uuid: 'w1', productUuid: 'p1', name: 'Red Shoes' },
          { uuid: 'w2', productUuid: 'p2', name: 'Green Hat' },
        ])
      )
      // Refetch after remove -> 1 item left
      .mockResolvedValueOnce(makeWishlist([{ uuid: 'w2', productUuid: 'p2', name: 'Green Hat' }]));

    mockedRemove.mockResolvedValueOnce({ ok: true });

    renderWithUser({ uuid: 'u-5' });

    // Find the card for "Red Shoes"
    const card = (await screen.findAllByText('Red Shoes'))[0].closest('.card') as HTMLElement;
    const removeBtn = within(card).getByRole('button', { name: /Remove/i });

    fireEvent.click(removeBtn);

    // remove API call uses product uuid
    await waitFor(() => expect(mockedRemove).toHaveBeenCalledWith('p1'));

    // Success alert
    expect(window.alert).toHaveBeenCalledWith('Item removed from wishlist.');

    // Refetch and update global count
    await waitFor(() => expect(mockedFetch).toHaveBeenCalledTimes(2));
    expect(wishlistCtx.setWishlistCount).toHaveBeenLastCalledWith(1);

    // "Red Shoes" gone, "Green Hat" remains
    expect(screen.queryByText('Red Shoes')).not.toBeInTheDocument();
    expect(screen.getByText('Green Hat')).toBeInTheDocument();
  });

  it('Remove: failure shows alert and does not refetch', async () => {
    mockedFetch.mockResolvedValueOnce(
      makeWishlist([{ uuid: 'w1', productUuid: 'p1', name: 'Red Shoes' }])
    );
    mockedRemove.mockRejectedValueOnce(new Error('remove fail'));
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithUser({ uuid: 'u-6' });

    const card = (await screen.findAllByText('Red Shoes'))[0].closest('.card') as HTMLElement;
    const removeBtn = within(card).getByRole('button', { name: /Remove/i });

    fireEvent.click(removeBtn);

    await waitFor(() => expect(mockedRemove).toHaveBeenCalledWith('p1'));
    expect(window.alert).toHaveBeenCalledWith('Failed to remove item from wishlist.');

    // No extra refetch on failure (only initial fetch)
    expect(mockedFetch).toHaveBeenCalledTimes(1);

    spy.mockRestore();
  });

  it('Move to Cart: success path refetches wishlist, updates wishlist & cart counts, and alerts', async () => {
    // Initial wishlist has 2 items
    mockedFetch
      .mockResolvedValueOnce(
        makeWishlist([
          { uuid: 'w1', productUuid: 'p1', name: 'Red Shoes' },
          { uuid: 'w2', productUuid: 'p2', name: 'Green Hat' },
        ])
      )
      // After moving item, wishlist has 1 item left
      .mockResolvedValueOnce(makeWishlist([{ uuid: 'w2', productUuid: 'p2', name: 'Green Hat' }]));

    mockedMoveToCart.mockResolvedValueOnce({ ok: true });

    // Cart GET returns 3 items total
    mockedApiGet.mockResolvedValueOnce({ data: { items: [{}, {}, {}] } });

    renderWithUser({ uuid: 'u-7' });

    const card = (await screen.findAllByText('Red Shoes'))[0].closest('.card') as HTMLElement;
    const moveBtn = within(card).getByRole('button', { name: /Move to Cart/i });

    fireEvent.click(moveBtn);

    await waitFor(() => expect(mockedMoveToCart).toHaveBeenCalledWith('p1'));
    expect(window.alert).toHaveBeenCalledWith('Item moved to cart!');

    // Wishlist refetch + count update
    await waitFor(() => expect(mockedFetch).toHaveBeenCalledTimes(2));
    expect(wishlistCtx.setWishlistCount).toHaveBeenLastCalledWith(1);

    // Cart refreshed and count updated
    await waitFor(() => expect(mockedApiGet).toHaveBeenCalledWith('/cart/'));
    expect(cartCtx.setCartCount).toHaveBeenCalledWith(3);
  });

  it('Move to Cart: failure shows alert; no wishlist/cart count updates', async () => {
    mockedFetch.mockResolvedValueOnce(
      makeWishlist([{ uuid: 'w1', productUuid: 'p1', name: 'Red Shoes' }])
    );
    mockedMoveToCart.mockRejectedValueOnce(new Error('move fail'));
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithUser({ uuid: 'u-8' });

    const card = (await screen.findAllByText('Red Shoes'))[0].closest('.card') as HTMLElement;
    const moveBtn = within(card).getByRole('button', { name: /Move to Cart/i });

    fireEvent.click(moveBtn);

    await waitFor(() => expect(mockedMoveToCart).toHaveBeenCalledWith('p1'));
    expect(window.alert).toHaveBeenCalledWith('Failed to move item to cart.');

    // No cart refresh
    expect(mockedApiGet).not.toHaveBeenCalled();

    spy.mockRestore();
  });
});
