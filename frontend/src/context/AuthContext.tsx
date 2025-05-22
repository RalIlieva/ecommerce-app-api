// src/context/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
} from 'react';
import api from '../api';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from '../utils';

interface User {
  uuid?: string;
  id?: string;
  email: string;
  name?: string;
  groups?: string[];
  profile_uuid?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  vendorLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  vendorLogin: async () => {},
  logout: () => {},
  register: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Login (customer)
  const login = async (email: string, password: string) => {
    const response = await api.post('/login/', { email, password });
    const { access, refresh } = response.data;
    setTokens(access, refresh);

    // Fetch full profile
    const me = await api.get('/user/me/');
    const userData: User = {
      uuid: me.data.uuid,
      email: me.data.email,
      name: me.data.name,
      profile_uuid: me.data.profile_uuid,
    };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Vendor login
  const vendorLogin = async (email: string, password: string) => {
    const response = await api.post('/vendor/login/login/', { email, password });
    const { access, refresh, user } = response.data;
    setTokens(access, refresh);
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  // Logout
  const logout = () => {
    clearTokens();
    localStorage.removeItem('user');
    setUser(null);
  };

  // Register (no auto-login)
  const register = async (email: string, password: string, name: string) => {
    await api.post('/user/register/', { email, password, name });
  };

  // On mount: restore tokens + user snapshot
  useEffect(() => {
    const token = getAccessToken();
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, vendorLogin, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;


// // src/context/AuthContext.tsx - to delete
// import React, {
//   createContext,
//   useState,
//   useEffect,
// } from 'react';
// import api from '../api';
// import {
//   getAccessToken,
//   getRefreshToken,
//   setTokens,
//   clearTokens,
// } from '../utils';
//
// interface User {
//   uuid?: string;
//   id?: string;
//   email: string;
//   name?: string;
//   groups?: string[];
//   profile_uuid?: string;
// }
//
// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   vendorLogin: (email: string, password: string) => Promise<void>;
//   logout: () => void;
//   register: (email: string, password: string, name: string) => Promise<void>;
// }
//
// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   loading: true,
//   login: async () => {},
//   vendorLogin: async () => {},
//   logout: () => {},
//   register: async () => {},
// });
//
// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//
//   // Login (customer)
//   const login = async (email: string, password: string) => {
//     const response = await api.post('/login/', { email, password });
//     const { access, refresh } = response.data;
//     setTokens(access, refresh);
//
//     // Fetch full profile
//     const me = await api.get('/user/me/');
//     const userData: User = {
//       uuid: me.data.uuid,
//       email: me.data.email,
//       name: me.data.name,
//       profile_uuid: me.data.profile_uuid,
//     };
//     setUser(userData);
//     localStorage.setItem('user', JSON.stringify(userData));
//   };
//
//   // Vendor login
//   const vendorLogin = async (email: string, password: string) => {
//     const response = await api.post('/vendor/login/login/', { email, password });
//     const { access, refresh, user } = response.data;
//     setTokens(access, refresh);
//     setUser(user);
//     localStorage.setItem('user', JSON.stringify(user));
//   };
//
//   // Logout
//   const logout = () => {
//     clearTokens();
//     localStorage.removeItem('user');
//     setUser(null);
//   };
//
//   // Register (no auto-login)
//   const register = async (email: string, password: string, name: string) => {
//     await api.post('/user/register/', { email, password, name });
//   };
//
//   // On mount: restore tokens + user snapshot
//   useEffect(() => {
//     const token = getAccessToken();
//     const storedUser = localStorage.getItem('user');
//
//     if (token && storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//     setLoading(false);
//   }, []);
//
//   return (
//     <AuthContext.Provider
//       value={{ user, loading, login, vendorLogin, logout, register }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };
//
// export default AuthContext;


// // Initial version - working
// import React, { createContext, useState, useEffect } from 'react';
// import api from '../api';
//
// interface User {
//   uuid?: string;
//   id?: string;
//   email: string;
//   name?: string;
//   groups?: string[];
//   profile_uuid?: string;
// }
//
// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   vendorLogin: (email: string, password: string) => Promise<void>;
//   logout: () => void;
//   register: (email: string, password: string, name: string) => Promise<void>;
// }
//
// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   loading: true,
//   login: async () => {},
//   vendorLogin: async () => {},
//   logout: () => {},
//   register: async () => {},
// });
//
// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//
//   useEffect(() => {
//     const storedAccessToken = localStorage.getItem('access_token');
//     const storedUser = localStorage.getItem('user');
//     if (storedAccessToken && storedUser) {
//       const parsedUser = JSON.parse(storedUser) as User;
//       setUser(parsedUser);
//     }
//     setLoading(false); // Set loading to false after fetching data
//   }, []);
//
// // For normal (non-vendor) login
//   const login = async (email: string, password: string) => {
//     const response = await api.post('/login/', { email, password });
//     const { access, refresh } = response.data;
//     localStorage.setItem('access_token', access);
//     localStorage.setItem('refresh_token', refresh);
//
// // Fetch user profile data
//     const meResponse = await api.get('/user/me/');
//     const { email: meEmail, name: meName, uuid: meUuid, profile_uuid } = meResponse.data;
//
//     const userData: User = {
//       uuid: meUuid,
//       email: meEmail,
//       name: meName,
//       profile_uuid,
//     };
//     localStorage.setItem('user', JSON.stringify(userData));
//     setUser(userData);
//   };
//
// // Vendor login
//   const vendorLogin = async (email: string, password: string) => {
//     const response = await api.post('/vendor/login/login/', { email, password });
//     const { access, refresh, user } = response.data;
//     localStorage.setItem('access_token', access);
//     localStorage.setItem('refresh_token', refresh);
//     localStorage.setItem('user', JSON.stringify(user));
//     setUser(user);
//   };
//
//   const logout = () => {
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('refresh_token');
//     localStorage.removeItem('user');
//     setUser(null);
//   };
//
//   const register = async (email: string, password: string, name: string) => {
//     await api.post('/user/register/', { email, password, name });
//   };
//
//   return (
//     <AuthContext.Provider value={{ user, loading, login, vendorLogin, logout, register }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
//
// export default AuthContext;
