// src/tests/VendorLogin.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import VendorLogin from '../pages/vendor/VendorLogin';

// --- MOCK useNavigate from react-router-dom ---
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom'
  );
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

import AuthContext from '../context/AuthContext';

describe('<VendorLogin />', () => {
  const vendorLogin = vi.fn();
  const logout = vi.fn();

  const renderWithProviders = () =>
    render(
      <AuthContext.Provider value={{ vendorLogin, logout } as any}>
        <MemoryRouter>
          <VendorLogin />
        </MemoryRouter>
      </AuthContext.Provider>
    );

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    mockedNavigate.mockReset();
  });

  it('submits credentials and navigates to vendor dashboard on success (vendor group present)', async () => {
    vendorLogin.mockImplementation(async (email: string, password: string) => {
      expect(email).toBe('alice@example.com');
      expect(password).toBe('s3cret');
      localStorage.setItem(
        'user',
        JSON.stringify({ groups: ['vendor', 'other'] })
      );
    });

    renderWithProviders();

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 's3cret' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Login as Vendor/i }));

    await waitFor(() =>
      expect(vendorLogin).toHaveBeenCalledWith('alice@example.com', 's3cret')
    );
    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith('/vendor/dashboard')
    );

    expect(screen.queryByText(/not authorized/i)).not.toBeInTheDocument();
    expect(logout).not.toHaveBeenCalled();
  });

  it('shows authorization error and calls logout when user is not in vendor group', async () => {
    vendorLogin.mockImplementation(async () => {
      localStorage.setItem('user', JSON.stringify({ groups: ['customer'] }));
    });

    renderWithProviders();

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'bob@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'pass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Login as Vendor/i }));

    await waitFor(() =>
      expect(vendorLogin).toHaveBeenCalledWith('bob@example.com', 'pass123')
    );

    expect(mockedNavigate).not.toHaveBeenCalled();
    await waitFor(() => expect(logout).toHaveBeenCalled());

    // Look for the text directly instead of role="alert"
    expect(
      await screen.findByText(/You are not authorized as a vendor\./i)
    ).toBeInTheDocument();
  });

  it('shows authorization error and calls logout when user data is missing', async () => {
    vendorLogin.mockResolvedValue(undefined);

    renderWithProviders();

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'carol@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'pw' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Login as Vendor/i }));

    await waitFor(() =>
      expect(vendorLogin).toHaveBeenCalledWith('carol@example.com', 'pw')
    );

    await waitFor(() => expect(logout).toHaveBeenCalled());
    expect(mockedNavigate).not.toHaveBeenCalled();

    expect(
      await screen.findByText(/You are not authorized as a vendor\./i)
    ).toBeInTheDocument();
  });

  it('shows generic error when vendorLogin rejects', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vendorLogin.mockRejectedValue(new Error('Network down'));

    renderWithProviders();

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'dave@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Login as Vendor/i }));

    // Look for the error text directly
    expect(
      await screen.findByText(
        /Login failed\. Please check your credentials and try again\./i
      )
    ).toBeInTheDocument();

    expect(mockedNavigate).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();

    spy.mockRestore();
  });
});
