import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    if (storedAccessToken && storedUser) {
      const parsedUser = JSON.parse(storedUser) as User;
      setUser(parsedUser);
    }
    setLoading(false); // Set loading to false after fetching data
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/login/', { email, password });
    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    const meResponse = await api.get('/user/me/');
    const { email: meEmail, name: meName, uuid: meUuid, profile_uuid } = meResponse.data;

    const userData: User = {
      uuid: meUuid,
      email: meEmail,
      name: meName,
      profile_uuid,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const vendorLogin = async (email: string, password: string) => {
    const response = await api.post('/vendor/login/login/', { email, password });
    const { access, refresh, user } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const register = async (email: string, password: string, name: string) => {
    await api.post('/user/register/', { email, password, name });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, vendorLogin, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;


// // src/context/AuthContext.tsx
// import React, { createContext, useState, useEffect } from 'react';
// import api from '../api';  // Your Axios instance
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
//   login: (email: string, password: string) => Promise<void>;
//   vendorLogin: (email: string, password: string) => Promise<void>;
//   logout: () => void;
//   register: (email: string, password: string, name: string) => Promise<void>;
// }
//
// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   login: async () => {},
//   vendorLogin: async () => {},
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
//   // For normal (non-vendor) login
//   const login = async (email: string, password: string) => {
//     const response = await api.post('/login/', { email, password });
//     const { access, refresh, email: userEmail, name, uuid: userUuid } = response.data;
//     localStorage.setItem('access_token', access);
//     localStorage.setItem('refresh_token', refresh);
//
//     // Fetch user profile data
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
//   // New function for vendor login
//   const vendorLogin = async (email: string, password: string) => {
//     const response = await api.post('/vendor/login/login/', { email, password });
//     // Expected response: { access, refresh, user: { id, email, groups } }
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
//     <AuthContext.Provider value={{ user, login, vendorLogin, logout, register }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
//
// export default AuthContext;


// // Initial working version - w/out vendor
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
