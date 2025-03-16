// src/pages/vendor/VendorLogin.tsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const VendorLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      // Attempt to log in using the common login function.
      await login(email, password);

      // Retrieve user data from localStorage
      const storedUser = localStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      // Check if user data includes groups and if "vendor" is among them.
      if (
        !parsedUser ||
        !parsedUser.groups ||
        !parsedUser.groups.includes('vendor')
      ) {
        logout();
        setError('You are not authorized as a vendor.');
      } else {
        // Successful vendor login; redirect to the vendor dashboard.
        navigate('/vendor/dashboard');
      }
    } catch (err: any) {
      console.error('Vendor login error:', err);
      setError('Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Vendor Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="vendor-email" className="form-label">
            Email address
          </label>
          <input
            type="email"
            id="vendor-email"
            className="form-control"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="vendor-password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="vendor-password"
            className="form-control"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Login as Vendor
        </button>
      </form>
    </div>
  );
};

export default VendorLogin;

// // src/pages/VendorLogin.tsx
// import React, { useState, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import AuthContext from '../../context/AuthContext';
//
// const VendorLogin: React.FC = () => {
//   const { login } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//
//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await login(email, password, true); // `true` indicates vendor login
//     } catch (err) {
//       setError('Invalid credentials. Please try again.');
//     }
//   };
//
//   return (
//     <div className="container mt-5">
//       <h2>Vendor Login</h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <form onSubmit={handleLogin}>
//         <div className="mb-3">
//           <label>Email:</label>
//           <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
//         </div>
//         <div className="mb-3">
//           <label>Password:</label>
//           <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
//         </div>
//         <button type="submit" className="btn btn-primary">Login</button>
//       </form>
//     </div>
//   );
// };
//
// export default VendorLogin;
