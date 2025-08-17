// src/tests/CartPage.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import CartPage from '../pages/CartPage';
import AuthContext from '../context/AuthContext';

// ---- Mock API ----
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));
import api from '../api';
const mockedGet = api.get as unknown as vi.Mock;
const mockedPatch = api.patch as unknown as vi.Mock;
const mockedDelete = api.delete as unknown as vi.Mock;

// ---- Mock CartContext hook ----
let cartCtx: { cartCount: number; setCartCount: vi.Mock };
vi.mock('../context/CartContext', () => ({
  useCartContext: () => cartCtx,
}));

// ---- Helpers ----
const renderWithUser = (user: any) =>
  render(
    <AuthContext.Provider value={{ user } as any}>
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );

const makeCart = (items: Array<{ uuid: string; name: string; price: number | string; qty: number }>) => ({
  items: items.map((it) => ({
    uuid: it.uuid,
    product: { name: it.name, price: it.price },
    quantity: it.qty,
  })),
});

beforeEach(() => {
  vi.resetAllMocks();
  cartCtx = { cartCount: 0, setCartCount: vi.fn() };
  vi.spyOn(window, 'alert').mockImplementation(() => {});
  vi.spyOn(window, 'confirm').mockImplementation(() => true);
});

afterEach(() => {
  (window.alert as any).mockRestore?.();
  (window.confirm as any).mockRestore?.();
});

describe('<CartPage />', () => {
  it('unauthenticated: prompts to log in and resets global cart count; does not fetch', async () => {
    renderWithUser(null);

    expect(
      screen.getByText(/Please/i)
    ).toHaveTextContent('Please log in to view your cart.');
    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/login');

    // setCartCount(0) called due to fetchCart early branch
    await waitFor(() => expect(cartCtx.setCartCount).toHaveBeenCalledWith(0));
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it('loading → error when fetch fails', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedGet.mockRejectedValueOnce(new Error('nope'));

    renderWithUser({ uuid: 'u1' });

    // spinner
    expect(screen.getByText(/Loading cart\.\.\./i)).toBeInTheDocument();

    // error
    expect(
      await screen.findByText(/Failed to fetch cart\./i)
    ).toBeInTheDocument();

    spy.mockRestore();
  });

  it('empty cart shows message and sets global count to 0', async () => {
    mockedGet.mockResolvedValueOnce({ data: makeCart([]) });

    renderWithUser({ uuid: 'u2' });

    expect(await screen.findByRole('heading', { name: /Your Cart is Empty/i })).toBeInTheDocument();
    expect(cartCtx.setCartCount).toHaveBeenCalledWith(0);
  });

  it('renders items with prices, UUID, quantities and checkout link; sets global count', async () => {
    mockedGet.mockResolvedValueOnce({
      data: makeCart([
        { uuid: 'i1', name: 'Widget', price: '10.5', qty: 2 },
        { uuid: 'i2', name: 'Gadget', price: 24, qty: 1 },
      ]),
    });

    renderWithUser({ uuid: 'u3' });

    expect(await screen.findByRole('heading', { name: /Your Cart/i })).toBeInTheDocument();

    // Two items
    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(2);

    // Item content & formatting
    expect(items[0]).toHaveTextContent('Widget');
    expect(items[0]).toHaveTextContent('Price: $10.50');
    expect(items[0]).toHaveTextContent('UUID: i1');

    expect(items[1]).toHaveTextContent('Gadget');
    expect(items[1]).toHaveTextContent('Price: $24.00');
    expect(items[1]).toHaveTextContent('UUID: i2');

    // Qty inputs reflect state
    expect(within(items[0]).getByRole('spinbutton')).toHaveValue(2);
    expect(within(items[1]).getByRole('spinbutton')).toHaveValue(1);

    // Global count set to number of items
    expect(cartCtx.setCartCount).toHaveBeenCalledWith(2);

    // Checkout link
    expect(screen.getByRole('link', { name: /Proceed to Checkout/i })).toHaveAttribute('href', '/checkout');
  });

  it('updates quantity: PATCH then refetch; input shows updated value', async () => {
    // initial fetch
    mockedGet
      .mockResolvedValueOnce({
        data: makeCart([
          { uuid: 'i1', name: 'Widget', price: '10.5', qty: 2 },
          { uuid: 'i2', name: 'Gadget', price: 24, qty: 1 },
        ]),
      })
      // refetch after PATCH
      .mockResolvedValueOnce({
        data: makeCart([
          { uuid: 'i1', name: 'Widget', price: '10.5', qty: 3 }, // updated
          { uuid: 'i2', name: 'Gadget', price: 24, qty: 1 },
        ]),
      });

    mockedPatch.mockResolvedValueOnce({ data: { ok: true } });

    renderWithUser({ uuid: 'u4' });

    // Wait for initial
    const list = await screen.findByRole('list');
    const item1 = within(list).getAllByRole('listitem')[0];
    const qtyInput = within(item1).getByRole('spinbutton') as HTMLInputElement;

    // Change to 3
    fireEvent.change(qtyInput, { target: { value: '3' } });

    // PATCH called with endpoint and body
    await waitFor(() =>
      expect(mockedPatch).toHaveBeenCalledWith('/cart/update/i1/', { quantity: 3 })
    );

    // Refetched GET called again
    await waitFor(() => expect(mockedGet).toHaveBeenCalledTimes(2));

    // Updated quantity visible
    expect(within(item1).getByRole('spinbutton')).toHaveValue(3);

    // Global count should be called again (still 2 items)
    expect(cartCtx.setCartCount).toHaveBeenLastCalledWith(2);
  });

  it('alerts when updating quantity fails', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedGet.mockResolvedValueOnce({
      data: makeCart([{ uuid: 'i1', name: 'Widget', price: 10, qty: 2 }]),
    });
    mockedPatch.mockRejectedValueOnce(new Error('patch fail'));

    renderWithUser({ uuid: 'u5' });

    const list = await screen.findByRole('list');
    const item1 = within(list).getAllByRole('listitem')[0];
    const qtyInput = within(item1).getByRole('spinbutton');

    fireEvent.change(qtyInput, { target: { value: '5' } });

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith('Failed to update item quantity.')
    );

    spy.mockRestore();
  });

  it('removes an item: DELETE then refetch; list updates and global count updated', async () => {
    // initial fetch
    mockedGet
      .mockResolvedValueOnce({
        data: makeCart([
          { uuid: 'i1', name: 'Widget', price: '10.5', qty: 2 },
          { uuid: 'i2', name: 'Gadget', price: 24, qty: 1 },
        ]),
      })
      // after remove
      .mockResolvedValueOnce({
        data: makeCart([{ uuid: 'i2', name: 'Gadget', price: 24, qty: 1 }]),
      });

    mockedDelete.mockResolvedValueOnce({ data: { ok: true } });

    renderWithUser({ uuid: 'u6' });

    const list = await screen.findByRole('list');
    const items = within(list).getAllByRole('listitem');
    const item1 = items[0];

    fireEvent.click(within(item1).getByRole('button', { name: /Remove/i }));

    await waitFor(() =>
      expect(mockedDelete).toHaveBeenCalledWith('/cart/remove/i1/')
    );
    await waitFor(() => expect(mockedGet).toHaveBeenCalledTimes(2));

    // Now only one item remains
    const list2 = screen.getByRole('list');
    expect(within(list2).getAllByRole('listitem')).toHaveLength(1);

    // Global count updated to 1
    expect(cartCtx.setCartCount).toHaveBeenLastCalledWith(1);
  });

  it('alerts when removing an item fails', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedGet.mockResolvedValueOnce({
      data: makeCart([{ uuid: 'i1', name: 'Widget', price: 10, qty: 2 }]),
    });
    mockedDelete.mockRejectedValueOnce(new Error('remove fail'));

    renderWithUser({ uuid: 'u7' });

    const list = await screen.findByRole('list');
    const item1 = within(list).getAllByRole('listitem')[0];

    fireEvent.click(within(item1).getByRole('button', { name: /Remove/i }));

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith('Failed to remove item from cart.')
    );

    spy.mockRestore();
  });

  it('clear cart: cancel in confirm prevents API call', async () => {
    mockedGet.mockResolvedValueOnce({
      data: makeCart([{ uuid: 'i1', name: 'Widget', price: 10, qty: 2 }]),
    });

    (window.confirm as vi.Mock).mockReturnValueOnce(false);

    renderWithUser({ uuid: 'u8' });

    await screen.findByRole('list');

    fireEvent.click(screen.getByRole('button', { name: /Clear Cart/i }));

    expect(mockedDelete).not.toHaveBeenCalledWith('/cart/clear/');
  });

  it('clear cart: confirms delete then refetches and shows empty', async () => {
    mockedGet
      .mockResolvedValueOnce({
        data: makeCart([{ uuid: 'i1', name: 'Widget', price: 10, qty: 2 }]),
      })
      .mockResolvedValueOnce({ data: makeCart([]) });

    mockedDelete.mockResolvedValueOnce({ data: { ok: true } });

    renderWithUser({ uuid: 'u9' });

    await screen.findByRole('list');
    fireEvent.click(screen.getByRole('button', { name: /Clear Cart/i }));

    await waitFor(() =>
      expect(mockedDelete).toHaveBeenCalledWith('/cart/clear/')
    );
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /Your Cart is Empty/i })).toBeInTheDocument()
    );
    expect(cartCtx.setCartCount).toHaveBeenLastCalledWith(0);
  });

  it('alerts when clear cart fails', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedGet.mockResolvedValueOnce({
      data: makeCart([{ uuid: 'i1', name: 'Widget', price: 10, qty: 2 }]),
    });
    mockedDelete.mockRejectedValueOnce(new Error('clear fail'));

    renderWithUser({ uuid: 'u10' });

    await screen.findByRole('list');
    fireEvent.click(screen.getByRole('button', { name: /Clear Cart/i }));

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith('Failed to clear cart.')
    );

    spy.mockRestore();
  });
});
