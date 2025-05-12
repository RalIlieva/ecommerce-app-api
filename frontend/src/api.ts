// src/api.ts
import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:8000/api/v1'
      : 'http://app:8000/api/v1'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to include the JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored auth data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      // Redirect to the appropriate login page
      const path = window.location.pathname;
      if (path.startsWith('/vendor')) {
        window.location.href = '/vendor/login';
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;


// // Initial version - working
// // src/api.ts
// import axios from 'axios';
//
// // Create an Axios instance
// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api/v1' : 'http://app:8000/api/v1'),
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
// export default api;
