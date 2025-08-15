// src/tests/CheckoutPage.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import AuthContext from '../context/AuthContext';

// --- Stripe mocks (must be defined BEFORE importing the page) ---
let stripeMock: any = null;
let elementsMock: any = null;

vi.mock('@stripe/react-stripe-js', () => {
  const React = require('react');
  return {
    Elements: ({ children }: any) => <div data-testid="elements">{children}</div>,
    CardElement: () => <div data-testid="card-element" />,
    useStripe: () => stripeMock,
    useElements: () => elementsMock,
  };
});

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn().mockResolvedValue({}), // not actually used by our Elements mock
}));

// --- Router: mock useNavigate ---
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// --- API mocks ---
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));
import api from '../api';
const mockedGet = api.get as unknown as vi.Mock;
const mockedPost = api.post as unknown as vi.Mock;

// --- Page under test (import AFTER mocks) ---
import CheckoutPage from '../pages/CheckoutPage';

// --- Helpers ---
const renderWithUser = (user: any) =>
  render(
    <AuthContext.Provider value={{ user } as any}>
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );

const clickProceed = () =>
  fireEvent.click(screen.getByRole('button', { name: /Proceed to Payment/i }));

const setField = (labelText: RegExp, value: string) => {
  const label = screen.getByText(labelText);
  // label and input are siblings inside the same .mb-3 div
  const wrapper = label.closest('.mb-3') as HTMLElement;
  const input = wrapper.querySelector('input') as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
};

describe('<CheckoutPage />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    stripeMock = null;
    elementsMock = null;
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    (window.alert as any).mockRestore?.();
  });

  it('renders form and does not fetch cart when unauthenticated', async () => {
    renderWithUser(null);

    // The form is visible (no Elements yet)
    expect(screen.getByRole('heading', { name: /Checkout/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Proceed to Payment/i })).toBeInTheDocument();

    // No cart fetch
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it('alerts when user is authenticated but cart failed to load (cart remains null)', async () => {
    mockedGet.mockRejectedValueOnce(new Error('cart fail'));

    renderWithUser({ uuid: 'u-1', email: 'x@y.z' });

    // wait for useEffect to run
    await waitFor(() => expect(mockedGet).toHaveBeenCalledWith('/cart/'));

    clickProceed();

    expect(window.alert).toHaveBeenCalledWith(
      'Your cart is empty. Please add items before checking out.'
    );
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it('alerts when user has no uuid', async () => {
    mockedGet.mockResolvedValueOnce({ data: { id: 1 } }); // cart set to non-null object

    renderWithUser({ email: 'no-uuid@example.com' });

    await waitFor(() => expect(mockedGet).toHaveBeenCalledWith('/cart/'));

    clickProceed();

    expect(window.alert).toHaveBeenCalledWith('You must be logged in to checkout.');
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it('alerts when neither a saved address is selected nor a new address is provided', async () => {
    mockedGet.mockResolvedValueOnce({ data: { id: 1 } });

    renderWithUser({ uuid: 'u-1' });

    await waitFor(() => expect(mockedGet).toHaveBeenCalledWith('/cart/'));

    // All newAddress fields are empty by default
    clickProceed();

    expect(window.alert).toHaveBeenCalledWith(
      'Please select an existing address or fill out a new one.'
    );
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it('starts checkout with a NEW address, then shows payment form', async () => {
    mockedGet.mockResolvedValueOnce({ data: { id: 1 } });

    // start checkout resolves with a session
    mockedPost.mockResolvedValueOnce({
      data: { uuid: 'sess-1', payment_secret: 'sec_123' },
    });

    renderWithUser({ uuid: 'u-1' });

    await waitFor(() => expect(mockedGet).toHaveBeenCalledWith('/cart/'));

    // Fill minimal address fields
    setField(/FULL NAME:/i, 'John Tester');
    setField(/CITY:/i, 'Sofia');

    clickProceed();

    await waitFor(() =>
      expect(mockedPost).toHaveBeenCalledWith('/checkout/start/', {
        new_shipping_address: expect.objectContaining({
          full_name: 'John Tester',
          city: 'Sofia',
        }),
      })
    );

    // Payment form appears
    expect(await screen.findByText(/Enter Payment Details/i)).toBeInTheDocument();
    expect(screen.getByTestId('card-element')).toBeInTheDocument();
  });

  it('completes payment successfully: confirms, completes, and navigates home', async () => {
    mockedGet.mockResolvedValueOnce({ data: { id: 1 } });
    mockedPost.mockResolvedValueOnce({
      data: { uuid: 'sess-2', payment_secret: 'sec_456' },
    });

    // Stripe ready
    const confirmCardPayment = vi.fn().mockResolvedValue({
      paymentIntent: { status: 'succeeded' },
    });
    stripeMock = { confirmCardPayment };
    elementsMock = { getElement: vi.fn().mockReturnValue({}) };

    renderWithUser({ uuid: 'u-2' });

    await waitFor(() => expect(mockedGet).toHaveBeenCalled());

    // Fill some address
    setField(/FULL NAME:/i, 'Jane Test');
    setField(/CITY:/i, 'Varna');

    clickProceed();

    // After session is set, payment form visible
    await screen.findByText(/Enter Payment Details/i);

    // Complete endpoint should be called after payment success
    mockedPost.mockResolvedValueOnce({ data: { ok: true } });

    fireEvent.click(screen.getByRole('button', { name: /Pay Now/i }));

    await waitFor(() =>
      expect(confirmCardPayment).toHaveBeenCalledWith('sec_456', {
        payment_method: { card: expect.any(Object) },
      })
    );
    await waitFor(() =>
      expect(mockedPost).toHaveBeenCalledWith('/checkout/complete/sess-2/')
    );
    expect(window.alert).toHaveBeenCalledWith('Checkout completed successfully!');
    expect(mockedNavigate).toHaveBeenCalledWith('/');
  });

  it('shows Stripe error message when confirmCardPayment returns an error', async () => {
    mockedGet.mockResolvedValueOnce({ data: { id: 1 } });
    mockedPost.mockResolvedValueOnce({
      data: { uuid: 'sess-err', payment_secret: 'sec_err' },
    });

    const confirmCardPayment = vi.fn().mockResolvedValue({
      error: { message: 'Card declined' },
    });
    stripeMock = { confirmCardPayment };
    elementsMock = { getElement: vi.fn().mockReturnValue({}) };

    renderWithUser({ uuid: 'u-3' });

    await waitFor(() => expect(mockedGet).toHaveBeenCalled());

    setField(/FULL NAME:/i, 'No Pay');
    setField(/CITY:/i, 'Sofia');
    clickProceed();

    await screen.findByText(/Enter Payment Details/i);
    fireEvent.click(screen.getByRole('button', { name: /Pay Now/i }));

    await waitFor(() => expect(confirmCardPayment).toHaveBeenCalled());
    expect(window.alert).toHaveBeenCalledWith('Card declined');
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it('alerts when Stripe has not loaded yet', async () => {
    mockedGet.mockResolvedValueOnce({ data: { id: 1 } });
    mockedPost.mockResolvedValueOnce({
      data: { uuid: 'sess-nostrp', payment_secret: 'sec_nostrp' },
    });

    // Stripe not ready
    stripeMock = null;
    elementsMock = null;

    renderWithUser({ uuid: 'u-4' });

    await waitFor(() => expect(mockedGet).toHaveBeenCalled());

    setField(/FULL NAME:/i, 'Wait Stripe');
    setField(/CITY:/i, 'Plovdiv');
    clickProceed();

    await screen.findByText(/Enter Payment Details/i);
    fireEvent.click(screen.getByRole('button', { name: /Pay Now/i }));

    expect(window.alert).toHaveBeenCalledWith('Stripe has not loaded yet.');
  });

  it('shows a helpful alert when backend says session already exists', async () => {
    mockedGet.mockResolvedValueOnce({ data: { id: 1 } });

    mockedPost.mockRejectedValueOnce({
      response: {
        data: { detail: 'Checkout session already exists for this cart.' },
      },
    });

    renderWithUser({ uuid: 'u-5' });

    await waitFor(() => expect(mockedGet).toHaveBeenCalled());

    setField(/FULL NAME:/i, 'Repeat Session');
    setField(/CITY:/i, 'Burgas');

    clickProceed();

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith(
        'A checkout session already exists for this cart. Try completing your current checkout or refresh the page.'
      )
    );
    expect(screen.queryByText(/Enter Payment Details/i)).not.toBeInTheDocument();
  });

  it('shows validation error blob when backend returns field errors object', async () => {
    mockedGet.mockResolvedValueOnce({ data: { id: 1 } });

    mockedPost.mockRejectedValueOnce({
      response: {
        data: {
          full_name: ['This field is required.'],
          address_line_1: ['This field is required.'],
        },
      },
    });

    renderWithUser({ uuid: 'u-6' });

    await waitFor(() => expect(mockedGet).toHaveBeenCalled());

    // IMPORTANT: fill at least one field; otherwise the client guard blocks and we see the "select or fill" alert instead.
    setField(/CITY:/i, 'Sofia');

    clickProceed();

    // Ensure the API was actually called with a new_shipping_address payload
    await waitFor(() =>
      expect(mockedPost).toHaveBeenCalledWith('/checkout/start/', {
        new_shipping_address: expect.objectContaining({ city: 'Sofia' }),
      })
    );

    // Now the server-side validation blob should surface
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Error(s):'))
    );

    // (Optional) sanity: the message mentions the specific fields
    const msg = (window.alert as unknown as vi.Mock).mock.calls.at(-1)?.[0] as string;
    expect(msg).toMatch(/full_name:/i);
    expect(msg).toMatch(/address_line_1:/i);
  });
});
