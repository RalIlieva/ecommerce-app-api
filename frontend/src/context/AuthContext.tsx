// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

interface AuthContextProps {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await api.get('/users/me/');
          setUser(response.data);
        } catch (err) {
          console.error(err);
          logout();
        }
      }
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/token/', { email, password });
    localStorage.setItem('access_token', response.data.access);
    setUser(response.data);
  };

  const register = async (email: string, password: string, name: string) => {
    await api.post('/users/register/', { email, password, name });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;


// // src/context/AuthContext.tsx
// import React, { createContext, useState, useEffect } from 'react';
// import api from '../api';
//
// interface User {
//   uuid: string;
//   email: string;
//   name: string;
// }
//
// interface AuthContextType {
//   user: User | null;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => void;
//   register: (email: string, password: string, name: string) => Promise<void>;
// }
//
// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   login: async () => {},
//   logout: () => {},
//   register: async () => {},
// });
//
// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//
//   // Check if token exists on mount and fetch user if available
//   useEffect(() => {
//     const token = localStorage.getItem('access_token');
//     if (token) {
//       fetchUserProfile();
//     }
//   }, []);
//
//   const fetchUserProfile = async () => {
//     try {
//       const response = await api.get('/user/me/');
//       setUser(response.data);
//     } catch (err) {
//       console.error('Failed to fetch user profile:', err);
//       // If fetching fails, tokens might be invalid or expired
//       logout();
//     }
//   };
//
//   const login = async (email: string, password: string) => {
//     // Call your login endpoint
//     const response = await api.post('/login/', { email, password });
//     localStorage.setItem('access_token', response.data.access);
//     localStorage.setItem('refresh_token', response.data.refresh);
//
//     await fetchUserProfile(); // Fetch the user profile after logging in
//   };
//
//   const logout = () => {
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('refresh_token');
//     setUser(null);
//   };
//
//   const register = async (email: string, password: string, name: string) => {
//     // Register the user via the backend
//     await api.post('/user/register/', { email, password, name });
//     // After registration, you could either:
//     // 1. Redirect to login page
//     // 2. Automatically log the user in.
//     // For now, let's just redirect them to login page after registration.
//   };
//
//   return (
//     <AuthContext.Provider value={{ user, login, logout, register }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
//
// export default AuthContext;
