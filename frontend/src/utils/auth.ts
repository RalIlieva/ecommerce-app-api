// src/utils/auth.ts

/**
 * Get auth token from localStorage.
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('access_token');
}

/**
 * Checks if user is vendor. (Simple approach using localStorage).
 * In a real app, you might decode a JWT or fetch user details from an API.
 */
export function isVendorUser(): boolean {
  const role = localStorage.getItem('user_role'); // e.g., "vendor"
  return role === 'vendor';
}
