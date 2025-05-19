// src/api.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from './utils';

// Dispatch a global event when session expires
function fireSessionExpired() {
  window.dispatchEvent(new Event('sessionExpired'));
}

// Main API client (with interceptor)
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:8000/api/v1'
      : 'http://app:8000/api/v1'),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// “Bare” client for refresh calls—no interceptors here
const authApi = axios.create({
  baseURL: api.defaults.baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = getRefreshToken();
      if (refresh) {
        try {
          // Use the bare client so we don't re-enter this interceptor
          const { data } = await authApi.post('/token/refresh/', { refresh });

          // Persist new tokens
          setTokens(data.access, data.refresh);

          // Update the failed request’s header and retry it
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.access}`;
          }
          return api(originalRequest);
        } catch {
          // Refresh failed: fall through to logout
        }
      }

      // No refresh token or refresh attempt failed
      clearTokens();
      fireSessionExpired();
    }

    return Promise.reject(error);
  }
);

export default api;

// // src/api.ts - currently working version
// import axios from 'axios';
//
// // Create an Axios instance
// const api = axios.create({
//   baseURL:
//     import.meta.env.VITE_API_URL ||
//     (window.location.hostname === 'localhost'
//       ? 'http://localhost:8000/api/v1'
//       : 'http://app:8000/api/v1'),
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });
//
// // Request interceptor to include the JWT token if present
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('access_token');
//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );
//
// // Response interceptor to catch 401 Unauthorized globally
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Clear stored auth data
//       localStorage.removeItem('access_token');
//       localStorage.removeItem('refresh_token');
//       localStorage.removeItem('user');
//
//       // Redirect to the appropriate login page
//       const path = window.location.pathname;
//       if (path.startsWith('/vendor')) {
//         window.location.href = '/vendor/login';
//       } else {
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );
//
// export default api;
//
//
// // // Initial version - working
// // // src/api.ts
// // import axios from 'axios';
// //
// // // Create an Axios instance
// // const api = axios.create({
// //   baseURL: import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api/v1' : 'http://app:8000/api/v1'),
// //   headers: {
// //     'Content-Type': 'application/json',
// //   },
// // });
// //
// // // Request interceptor to include the JWT token if present
// // api.interceptors.request.use(
// //   (config) => {
// //     const token = localStorage.getItem('access_token');
// //     if (token && config.headers) {
// //       config.headers.Authorization = `Bearer ${token}`;
// //     }
// //     return config;
// //   },
// //   (error) => Promise.reject(error)
// // );
// //
// // export default api;
