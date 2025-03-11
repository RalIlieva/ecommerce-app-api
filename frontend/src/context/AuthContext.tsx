// src/context/AuthContext.tsx
// Version with vendor separate UI
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

interface User {
  uuid: string;
  email: string;
  name: string;
  user_type: 'customer' | 'vendor' | 'admin';  // Store user role
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, isVendor?: boolean) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string, isVendor?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  register: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string, isVendor = false) => {
    const loginEndpoint = isVendor ? '/vendor/auth/login/' : '/auth/login/';
    const response = await api.post(loginEndpoint, { email, password });

    const { access, refresh, user } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);

    // Redirect based on user type
    if (user.user_type === 'vendor') {
      navigate('/vendor/dashboard');
    } else {
      navigate('/');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const register = async (email: string, password: string, name: string, isVendor = false) => {
    const registerEndpoint = isVendor ? '/vendor/auth/register/' : '/auth/register/';
    await api.post(registerEndpoint, { email, password, name });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

// Initial working version - w/out vendor
// // src/context/AuthContext.tsx
// import React, { createContext, useState, useEffect } from 'react';
// import api from '../api';  // <-- Import the Axios instance
//
// interface User {
//   uuid: string;
//   email: string;
//   name: string;
//   profile_uuid?: string;
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
//   useEffect(() => {
//     const storedAccessToken = localStorage.getItem('access_token');
//     const storedUser = localStorage.getItem('user');
//     if (storedAccessToken && storedUser) {
//       const parsedUser = JSON.parse(storedUser) as User;
//       setUser(parsedUser);
//     }
//   }, []);
//
//   const login = async (email: string, password: string) => {
//     // 1) Send login data to your /login/ endpoint
//     const response = await api.post('/login/', { email, password });
//     const { access, refresh, email: userEmail, name, uuid: userUuid } = response.data;
//
//     // 2) Store tokens locally
//     localStorage.setItem('access_token', access);
//     localStorage.setItem('refresh_token', refresh);
//
//     // 3) Now fetch /user/me to get the user's profile
//     const meResponse = await api.get('/user/me/');
//     const { email: meEmail, name: meName, uuid: meUuid, profile_uuid } = meResponse.data;
//
//     // 4) Update user state
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
//     <AuthContext.Provider value={{ user, login, logout, register }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
//
// export default AuthContext;
