// src/tests/Login.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import AuthContext from '../context/AuthContext';

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

describe('<Login /> (customer)', () => {
  const login = vi.fn();

  const renderWithProviders = () =>
    render(
      <AuthContext.Provider value={{ login } as any}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthContext.Provider>
    );

  beforeEach(() => {
    vi.resetAllMocks();
    mockedNavigate.mockReset();
  });

  it('renders fields and helpful links', () => {
    renderWithProviders();

    // Fields
    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();

    // Submit button
    expect(
      screen.getByRole('button', { name: /Login/i })
    ).toBeInTheDocument();

    // Links
    const register = screen.getByRole('link', { name: /Register here/i });
    expect(register).toHaveAttribute('href', '/register');

    const forgot = screen.getByRole('link', {
      name: /Forgot your password\?/i,
    });
    expect(forgot).toHaveAttribute('href', '/password-reset');
  });

  it('calls login with credentials and navigates to "/" on success', async () => {
    login.mockResolvedValue(undefined);

    renderWithProviders();

    fireEvent.change(screen.getByLabelText(/Email:/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password:/i), {
      target: { value: 'topsecret' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() =>
      expect(login).toHaveBeenCalledWith('user@example.com', 'topsecret')
    );
    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith('/'));

    // No error alert
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an error alert when login rejects and does not navigate', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    login.mockRejectedValue(new Error('bad creds'));

    renderWithProviders();

    fireEvent.change(screen.getByLabelText(/Email:/i), {
      target: { value: 'oops@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password:/i), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Invalid email or password.');

    expect(mockedNavigate).not.toHaveBeenCalled();

    spy.mockRestore();
  });
});
