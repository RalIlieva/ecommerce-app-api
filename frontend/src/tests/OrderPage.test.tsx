// src/tests/OrderPage.test.tsx
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import OrderPage from '../pages/OrderPage';
import AuthContext from '../context/AuthContext';

// --- Mock router params ---
const mockedParams = { order_uuid: 'o-123' };
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => mockedParams,
  };
});

// --- Mock API ---
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
  },
}));
import api from '../api';
const mockedGet = api.get as unknown as vi.Mock;

const renderWithUser = (user: any) =>
  render(
    <AuthContext.Provider value={{ user } as any}>
      <MemoryRouter>
        <OrderPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe('<OrderPage />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedParams.order_uuid = 'o-123';
  });

  it('asks user to log in when unauthenticated (no fetch call)', () => {
    renderWithUser(null);

    expect(
      screen.getByText(/You must be logged in to view this page\./i)
    ).toBeInTheDocument();
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it('shows spinner, fetches order, and renders details with items & shipping', async () => {
    const orderPayload = {
      uuid: 'o-123',
      status: 'processing',
      created: '2025-08-01T12:00:00Z',
      total_amount: '45.67',
      shipping_address: {
        full_name: 'John Doe',
        address_line_1: '123 Main St',
        address_line_2: 'Apt 4',
        city: 'Sofia',
        postal_code: '1000',
        country: 'BG',
        phone_number: '123456',
      },
      items: [
        { id: 1, product: { name: 'Widget' }, quantity: 2, price: '10.5' },
        { id: 2, product: { name: 'Gadget' }, quantity: 1, price: 24 },
      ],
    };
    mockedGet.mockResolvedValueOnce({ data: orderPayload });

    const user = { profile_uuid: 'p-999', email: 'u@example.com' };
    renderWithUser(user);

    // Initial spinner
    expect(screen.getByText(/Loading order\.\.\./i)).toBeInTheDocument();

    // API call
    await waitFor(() =>
      expect(mockedGet).toHaveBeenCalledWith('/orders/o-123/')
    );

    // Header
    expect(await screen.findByRole('heading', { name: /Order #o-123/i })).toBeInTheDocument();
    expect(screen.getByText(/processing/i)).toBeInTheDocument();

    // Created date line (use same formatting as the component)
    const createdStr = new Date(orderPayload.created).toLocaleDateString();
    expect(
      screen.getByText((_, node) =>
        (node?.textContent ?? '').includes(`Created on: ${createdStr}`)
      )
    ).toBeInTheDocument();

    // Total amount
    expect(screen.getByText(/Order Total:/i).nextSibling).toHaveTextContent('$45.67');

    // Shipping address block
    expect(screen.getByText(/Shipping Address/i)).toBeInTheDocument();
    expect(screen.getByText(/Name:/i).nextSibling).toHaveTextContent('John Doe');
    expect(screen.getByText(/Address:/i).nextSibling).toHaveTextContent(
      '123 Main St, Apt 4'
    );
    expect(screen.getByText(/City:/i).nextSibling).toHaveTextContent('Sofia');
    expect(screen.getByText(/Postal Code:/i).nextSibling).toHaveTextContent('1000');
    expect(screen.getByText(/Country:/i).nextSibling).toHaveTextContent('BG');
    expect(screen.getByText(/Phone:/i).nextSibling).toHaveTextContent('123456');

    // Items list
    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(2);

    // Item 1
    expect(items[0]).toHaveTextContent('Widget');
    expect(items[0]).toHaveTextContent('(x2)');
    expect(items[0]).toHaveTextContent('$10.50');

    // Item 2
    expect(items[1]).toHaveTextContent('Gadget');
    expect(items[1]).toHaveTextContent('(x1)');
    expect(items[1]).toHaveTextContent('$24.00');

    // Back link
    const back = screen.getByRole('link', { name: /Back to Profile/i });
    expect(back).toHaveAttribute('href', `/profile/${user.profile_uuid}`);
  });

  it('renders error message when fetch fails', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedGet.mockRejectedValueOnce(new Error('nope'));

    renderWithUser({ profile_uuid: 'p-1' });

    expect(
      await screen.findByText(/Failed to fetch order details\./i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/Loading order\.\.\./i)).not.toBeInTheDocument();

    spy.mockRestore();
  });

  it('omits total amount and shipping section when not provided', async () => {
    const orderPayload = {
      uuid: 'o-777',
      status: 'shipped',
      created: '2025-07-20T10:00:00Z',
      // total_amount intentionally omitted
      // shipping_address intentionally omitted
      items: [{ id: 1, product: { name: 'Single' }, quantity: 1, price: '9.99' }],
    };
    mockedParams.order_uuid = 'o-777';
    mockedGet.mockResolvedValueOnce({ data: orderPayload });

    renderWithUser({ profile_uuid: 'ppp' });

    expect(await screen.findByRole('heading', { name: /Order #o-777/i })).toBeInTheDocument();

    // No "Order Total" label
    expect(screen.queryByText(/Order Total:/i)).not.toBeInTheDocument();

    // No shipping section header
    expect(screen.queryByText(/Shipping Address/i)).not.toBeInTheDocument();

    // Item renders
    expect(screen.getByText('Single')).toBeInTheDocument();
  });
});
