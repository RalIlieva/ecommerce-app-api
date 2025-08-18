// src/tests/EditProfileForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

import EditProfileForm from '../pages/EditProfileForm';

// --- Mock API ---
vi.mock('../api', () => ({
  default: {
    patch: vi.fn(),
  },
}));
import api from '../api';
const mockedPatch = api.patch as unknown as vi.Mock;

const baseProfile = {
  profile_uuid: 'p-1',
  gender: 'o', // m/f/o per component
  phone_number: '555-000',
  address: '123 Test St',
  date_of_birth: '1990-01-01',
  about: 'About text',
  user: { uuid: 'u-1', email: 'me@example.com', name: 'Alice' },
};

const renderForm = (overrides: Partial<typeof baseProfile> = {}) => {
  const onCancel = vi.fn();
  const onUpdate = vi.fn();
  const profile = { ...baseProfile, ...overrides } as any;

  render(
    <EditProfileForm
      profile={profile}
      onCancel={onCancel}
      onUpdate={onUpdate}
    />
  );

  return { onCancel, onUpdate, profile };
};

describe('<EditProfileForm />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders initial values and calls onCancel', () => {
    const { onCancel } = renderForm();

    expect(screen.getByLabelText(/Name/i)).toHaveValue('Alice');
    expect(screen.getByLabelText(/Gender/i)).toHaveValue('o');
    expect(screen.getByLabelText(/Phone Number/i)).toHaveValue('555-000');
    expect(screen.getByLabelText(/Address/i)).toHaveValue('123 Test St');
    expect(screen.getByLabelText(/Date of Birth/i)).toHaveValue('1990-01-01');
    expect(screen.getByLabelText(/About/i)).toHaveValue('About text');

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('submits with only changed fields (name) and shows success + calls onUpdate', async () => {
    const { onUpdate, profile } = renderForm();

    // Change only the name
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Alice Cooper' },
    });

    const updatedProfile = {
      ...profile,
      user: { ...profile.user, name: 'Alice Cooper' },
    };

    // Defer the PATCH resolution so we can assert the loading UI state
    let resolvePatch!: (value: any) => void;
    const patchPromise = new Promise<any>((resolve) => {
      resolvePatch = resolve;
    });
    mockedPatch.mockReturnValueOnce(patchPromise);

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    // While pending, the button should show "Saving..." and be disabled
    const savingBtn = await screen.findByRole('button', { name: /Saving\.\.\./i });
    expect(savingBtn).toBeDisabled();

    // Now resolve the PATCH
    resolvePatch({ data: updatedProfile });

    // Assert API payload and onUpdate call
    await waitFor(() =>
      expect(mockedPatch).toHaveBeenCalledWith(
        `/user/profile/${profile.profile_uuid}/`,
        { user: { name: 'Alice Cooper' } }
      )
    );

    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith(updatedProfile));

    // Success message visible; button returns to normal state
    expect(screen.getByText(/Profile updated successfully!/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeEnabled();
  });

  it('sends null for cleared fields (only include changed ones)', async () => {
    const { profile } = renderForm();

    // Clear phone number (was "555-000")
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: '' },
    });

    mockedPatch.mockResolvedValueOnce({ data: profile });

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() =>
      expect(mockedPatch).toHaveBeenCalledWith(
        `/user/profile/${profile.profile_uuid}/`,
        { phone_number: null }
      )
    );
  });

  it('renders field errors and a generic form error when API returns validation errors', async () => {
    renderForm();

    // Change a field to force payload include
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Al' },
    });

    mockedPatch.mockRejectedValueOnce({
      response: {
        data: {
          name: ['Too short'],
          phone_number: ['Invalid format'],
        },
      },
    });

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    expect(
      await screen.findByText(/Please fix the highlighted errors and try again\./i)
    ).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Name/i);
    expect(nameInput).toHaveClass('is-invalid');
    expect(screen.getByText(/Too short/i)).toBeInTheDocument();

    const phoneInput = screen.getByLabelText(/Phone Number/i);
    expect(phoneInput).toHaveClass('is-invalid');
    expect(screen.getByText(/Invalid format/i)).toBeInTheDocument();
  });

  it('supports error details nested under "detail"', async () => {
    renderForm();

    // Change name to include it in payload (empty → null)
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: '' },
    });

    mockedPatch.mockRejectedValueOnce({
      response: {
        data: {
          detail: {
            name: ['This field cannot be blank.'],
            address: ['Too long'],
          },
        },
      },
    });

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    expect(
      await screen.findByText(/Please fix the highlighted errors and try again\./i)
    ).toBeInTheDocument();

    expect(screen.getByText(/This field cannot be blank\./i)).toBeInTheDocument();
    expect(screen.getByText(/Too long/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/Name/i)).toHaveClass('is-invalid');
    expect(screen.getByLabelText(/Address/i)).toHaveClass('is-invalid');
  });

  it('shows a generic error when there is no server response', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/About/i), {
      target: { value: 'New about' },
    });

    mockedPatch.mockRejectedValueOnce(new Error('network down'));

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    expect(
      await screen.findByText(/Failed to update profile\. Please try again\./i)
    ).toBeInTheDocument();
  });
});
