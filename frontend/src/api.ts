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

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:8000/api/v1'
      : 'http://app:8000/api/v1'),
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, try a single refresh + retry; if that fails, fire event & redirect
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      getRefreshToken()
    ) {
      originalRequest._retry = true;
      try {
        const { data } = await api.post('/token/refresh/', {
          refresh: getRefreshToken(),
        });
        setTokens(data.access, data.refresh);
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${data.access}`,
        };
        return api(originalRequest);
      } catch {
        // Refresh failed: clear tokens, notify app, then redirect
        clearTokens();
        fireSessionExpired();
        const redirectTo = window.location.pathname.startsWith('/vendor')
          ? '/vendor/login'
          : '/login';
        window.location.href = redirectTo;
        return Promise.reject(error);
      }
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
