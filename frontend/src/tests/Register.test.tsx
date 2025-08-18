// src/tests/Register.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import Register from '../pages/Register';
import AuthContext from '../context/AuthContext';

// Mock router navigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockedNavigate };
});

const renderWithAuth = (registerFn: any) =>
  render(
    <AuthContext.Provider value={{ register: registerFn } as any}>
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe('<Register />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the form fields and footer link', () => {
    renderWithAuth(vi.fn());

    expect(screen.getByRole('heading', { name: /Register/i })).toBeInTheDocument();

    expect(screen.getByLabelText(/^Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password:/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();

    const footerLink = screen.getByRole('link', { name: /Login here/i });
    expect(footerLink).toHaveAttribute('href', '/login');
  });

  it('submits values, calls register, and navigates to /login on success', async () => {
    const registerMock = vi.fn().mockResolvedValueOnce({ ok: true });
    renderWithAuth(registerMock);

    fireEvent.change(screen.getByLabelText(/^Name:/i), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText(/^Email:/i), { target: { value: 'alice@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password:/i), { target: { value: 'secret123' } });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() =>
      expect(registerMock).toHaveBeenCalledWith('alice@example.com', 'secret123', 'Alice')
    );

    expect(mockedNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows an error alert when register rejects', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const registerMock = vi.fn().mockRejectedValueOnce(new Error('backend says nope'));
    renderWithAuth(registerMock);

    fireEvent.change(screen.getByLabelText(/^Name:/i), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByLabelText(/^Email:/i), { target: { value: 'bob@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password:/i), { target: { value: 'hunter2' } });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('An error occurred during registration. Please try again.');
    expect(mockedNavigate).not.toHaveBeenCalled();

    spy.mockRestore();
  });
});
