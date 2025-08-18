// // src/tests/Profile.test.tsx
// import React from 'react';
// import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import { vi } from 'vitest';
// import { MemoryRouter } from 'react-router-dom';
//
// import Profile from '../pages/Profile';
// import AuthContext from '../context/AuthContext';
//
// // --- Mock API ---
// vi.mock('../api', () => ({
//   default: {
//     get: vi.fn(),
//   },
// }));
// import api from '../api';
// const mockedGet = api.get as unknown as vi.Mock;
//
// // --- Mock EditProfileForm so we can trigger onCancel/onUpdate easily ---
// vi.mock('../pages/EditProfileForm', () => ({
//   default: ({ profile, onCancel, onUpdate }: any) => (
//     <div data-testid="edit-profile-form">
//       <div>Editing {profile?.user?.name}</div>
//       <button onClick={onCancel}>Cancel</button>
//       <button
//         onClick={() =>
//           onUpdate({
//             ...profile,
//             user: { ...profile.user, name: 'Updated Name' },
//           })
//         }
//       >
//         Save
//       </button>
//     </div>
//   ),
// }));
//
// const renderWithUser = (user: any) =>
//   render(
//     <AuthContext.Provider value={{ user } as any}>
//       <MemoryRouter>
//         <Profile />
//       </MemoryRouter>
//     </AuthContext.Provider>
//   );
//
// // helpers
// const profilePayload = {
//   profile_uuid: 'p-123',
//   gender: 'Other',
//   phone_number: '0888 000 111',
//   address: '123 Test St',
//   date_of_birth: '1990-01-01',
//   about: 'About me…',
//   user: { uuid: 'u-1', email: 'me@example.com', name: 'Original Name' },
// };
//
// const ordersResults = [
//   {
//     uuid: 'o-1',
//     status: 'processing',
//     created: '2025-08-01T12:00:00Z',
//   },
//   {
//     uuid: 'o-2',
//     status: 'shipped',
//     created: '2025-08-02T09:05:00Z',
//   },
// ];
//
// describe('<Profile />', () => {
//   beforeEach(() => {
//     vi.resetAllMocks();
//   });
//
//   it('unauthenticated: shows guard message and no API calls', () => {
//     renderWithUser(null);
//
//     expect(
//       screen.getByText(/You must be logged in to view this page\./i)
//     ).toBeInTheDocument();
//     expect(mockedGet).not.toHaveBeenCalled();
//   });
//
//   it('shows spinner, then renders profile details and empty orders state', async () => {
//     mockedGet.mockImplementation((url: string) => {
//       if (url.startsWith('/user/profile/')) {
//         return Promise.resolve({ data: profilePayload });
//       }
//       if (url === '/orders/orders/') {
//         return Promise.resolve({ data: { results: [] } });
//       }
//       return Promise.reject(new Error('unknown url'));
//     });
//
//     renderWithUser({ profile_uuid: 'p-123' });
//
//     // Spinner
//     expect(screen.getByText(/Loading profile\.\.\./i)).toBeInTheDocument();
//
//     // API calls
//     await waitFor(() =>
//       expect(mockedGet).toHaveBeenCalledWith('/user/profile/p-123/')
//     );
//     await waitFor(() => expect(mockedGet).toHaveBeenCalledWith('/orders/orders/'));
//
//     // Profile card
//     expect(await screen.findByRole('heading', { name: /My Profile/i })).toBeInTheDocument();
//     expect(screen.getByText(/Name:/i).parentElement).toHaveTextContent('Original Name');
//     expect(screen.getByText(/Email:/i).parentElement).toHaveTextContent('me@example.com');
//
//     // Change Password link
//     const changePwd = screen.getByRole('link', { name: /Change Password/i });
//     expect(changePwd).toHaveAttribute('href', '/change-password');
//
//     // Empty orders
//     expect(screen.getByRole('heading', { name: /My Orders/i })).toBeInTheDocument();
//     expect(screen.getByText(/No orders found\./i)).toBeInTheDocument();
//   });
//
//   it('renders orders table with rows and links when results exist', async () => {
//     mockedGet.mockImplementation((url: string) => {
//       if (url.startsWith('/user/profile/')) {
//         return Promise.resolve({ data: profilePayload });
//       }
//       if (url === '/orders/orders/') {
//         return Promise.resolve({ data: { results: ordersResults } });
//       }
//       return Promise.reject(new Error('unknown url'));
//     });
//
//     renderWithUser({ profile_uuid: 'p-123' });
//
//     // Table appears
//     const table = await screen.findByRole('table');
//     const rows = within(table).getAllByRole('row');
//     // header + 2 data rows
//     expect(rows).toHaveLength(1 + 2);
//
//     // Row for o-1
//     const r1 = rows[1];
//     expect(within(r1).getByText('o-1')).toBeInTheDocument();
//     expect(within(r1).getByText(/processing/i)).toBeInTheDocument();
//     const created1 = new Date(ordersResults[0].created).toLocaleDateString();
//     expect(within(r1).getByText(created1)).toBeInTheDocument();
//     const link1 = within(r1).getByRole('link', { name: /View Details/i });
//     expect(link1).toHaveAttribute('href', '/order/o-1');
//
//     // Row for o-2
//     const r2 = rows[2];
//     expect(within(r2).getByText('o-2')).toBeInTheDocument();
//     expect(within(r2).getByText(/shipped/i)).toBeInTheDocument();
//     const created2 = new Date(ordersResults[1].created).toLocaleDateString();
//     expect(within(r2).getByText(created2)).toBeInTheDocument();
//     const link2 = within(r2).getByRole('link', { name: /View Details/i });
//     expect(link2).toHaveAttribute('href', '/order/o-2');
//   });
//
//   it('shows error when profile fetch fails', async () => {
//     const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
//     mockedGet.mockImplementation((url: string) => {
//       if (url.startsWith('/user/profile/')) {
//         return Promise.reject(new Error('profile fail'));
//       }
//       if (url === '/orders/orders/') {
//         return Promise.resolve({ data: { results: [] } });
//       }
//       return Promise.reject(new Error('unknown url'));
//     });
//
//     renderWithUser({ profile_uuid: 'p-123' });
//
//     expect(
//       await screen.findByText(/Failed to fetch profile details\./i)
//     ).toBeInTheDocument();
//
//     spy.mockRestore();
//   });
//
//   it('shows error when orders response shape is unexpected', async () => {
//     mockedGet.mockImplementation((url: string) => {
//       if (url.startsWith('/user/profile/')) {
//         return Promise.resolve({ data: profilePayload });
//       }
//       if (url === '/orders/orders/') {
//         // results not an array → triggers "Unexpected response format."
//         return Promise.resolve({ data: { results: 'not-an-array' } as any });
//       }
//       return Promise.reject(new Error('unknown url'));
//     });
//
//     renderWithUser({ profile_uuid: 'p-123' });
//
//     expect(
//       await screen.findByText(/Unexpected response format\./i)
//     ).toBeInTheDocument();
//   });
//
//   it('enters edit mode and allows cancel/save (updates name shown)', async () => {
//     mockedGet.mockImplementation((url: string) => {
//       if (url.startsWith('/user/profile/')) {
//         return Promise.resolve({ data: profilePayload });
//       }
//       if (url === '/orders/orders/') {
//         return Promise.resolve({ data: { results: [] } });
//       }
//       return Promise.reject(new Error('unknown url'));
//     });
//
//     renderWithUser({ profile_uuid: 'p-123' });
//
//     // Wait for profile view
//     await screen.findByRole('heading', { name: /My Profile/i });
//     expect(screen.getByText(/Name:/i).parentElement).toHaveTextContent('Original Name');
//
//     // Enter edit
//     fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));
//     const editForm = await screen.findByTestId('edit-profile-form');
//     expect(editForm).toBeInTheDocument();
//
//     // Cancel returns to view
//     fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
//     expect(await screen.findByRole('heading', { name: /My Profile/i })).toBeInTheDocument();
//
//     // Enter edit again and save (mocked form sets name to "Updated Name")
//     fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));
//     await screen.findByTestId('edit-profile-form');
//     fireEvent.click(screen.getByRole('button', { name: /Save/i }));
//
//     // Back to view with updated name
//     expect(await screen.findByRole('heading', { name: /My Profile/i })).toBeInTheDocument();
//     expect(screen.getByText(/Name:/i).parentElement).toHaveTextContent('Updated Name');
//   });
// });


// src/tests/VendorOrderManagement.test.tsx
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import VendorOrderManagement from '../pages/vendor/VendorOrderManagement';

// --- Mock API ---
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));
import api from '../api';
const mockedGet = api.get as unknown as vi.Mock;

describe('VendorOrderManagement', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading, then renders a row per order (row-based assertions)', async () => {
    const ordersPayload = {
      results: [
        { uuid: 'uuid-1', status: 'processing', created: '2025-08-01T12:00:00Z' },
        { uuid: 'uuid-2', status: 'shipped',    created: '2025-08-02T09:05:00Z' },
      ],
    };
    mockedGet.mockResolvedValueOnce({ data: ordersPayload });

    render(
      <MemoryRouter>
        <VendorOrderManagement />
      </MemoryRouter>
    );

    // Loading indicator (adjust to your component's exact text if different)
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for the table to appear
    const table = await screen.findByRole('table');

    // Grab the tbody (rowgroup) that contains data rows
    const rowgroups = within(table).getAllByRole('rowgroup');
    // Prefer the <tbody> group if present; otherwise take the last group
    const tbody =
      rowgroups.find((rg) => rg.tagName.toLowerCase() === 'tbody') ||
      rowgroups[rowgroups.length - 1];

    // Data rows (exclude the header row which is usually in <thead>)
    const rows = within(tbody).getAllByRole('row');
    expect(rows).toHaveLength(ordersPayload.results.length);

    // Find the specific row by combined text content (works even if broken up by elements)
    const rowForUuid1 = rows.find((r) =>
      (r.textContent || '').includes('uuid-1')
    );
    expect(rowForUuid1).toBeTruthy();

    // Assert other fields on the same row
    const created1 = new Date(ordersPayload.results[0].created).toLocaleDateString();
    expect(rowForUuid1!).toHaveTextContent('processing');
    expect(rowForUuid1!).toHaveTextContent(created1);

    // And the second row
    const rowForUuid2 = rows.find((r) =>
      (r.textContent || '').includes('uuid-2')
    );
    expect(rowForUuid2).toBeTruthy();
    const created2 = new Date(ordersPayload.results[1].created).toLocaleDateString();
    expect(rowForUuid2!).toHaveTextContent('shipped');
    expect(rowForUuid2!).toHaveTextContent(created2);

    // (Optional) If there’s a “View Details” link/button per row, assert via role:
    // const link1 = within(rowForUuid1!).getByRole('link', { name: /view details/i });
    // expect(link1).toHaveAttribute('href', '/vendor/orders/uuid-1'); // adjust as needed

    // Ensure the fetch happened (no brittle URL assertion)
    await waitFor(() => expect(mockedGet).toHaveBeenCalled());
  });
});
