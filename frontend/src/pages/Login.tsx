// src/pages/Login.tsx
import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login: React.FC = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // After successful login, redirect to home or dashboard
      navigate('/');
    } catch (err: any) {
      setError('Invalid email or password.');
      console.error(err);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Login</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleLogin}>
                {/* Email Field */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email:
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                {/* Password Field */}
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password:
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    Login
                  </button>
                </div>
              </form>
            </div>
            <div className="card-footer text-muted text-center">
              Don't have an account? <Link to="/register">Register here</Link>
              <br />
              <Link to="/password-reset" className="mt-2 d-block">
                Forgot your password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;



// // src/pages/Login.tsx
// import React, { useState, useContext } from 'react';
// import AuthContext from '../context/AuthContext';
// import { useNavigate, Link } from 'react-router-dom';
//
// const Login: React.FC = () => {
//   const { login } = useContext(AuthContext);
//   const navigate = useNavigate();
//
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState<string | null>(null);
//
//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await login(email, password);
//       navigate('/products'); // Redirect to products page after login
//     } catch (err: any) {
//       if (err.response && err.response.status === 401) {
//         setError('Invalid email or password.');
//       } else {
//         setError('An unexpected error occurred. Please try again.');
//       }
//       console.error(err);
//     }
//   };
//
//   return (
//     <div className="container mt-5">
//       <div className="row justify-content-center">
//         <div className="col-md-6">
//           <div className="card shadow">
//             <div className="card-header bg-primary text-white">
//               <h3 className="mb-0">Login</h3>
//             </div>
//             <div className="card-body">
//               <form onSubmit={handleLogin}>
//                 {/* Email Field */}
//                 <div className="mb-3">
//                   <label htmlFor="email" className="form-label">
//                     Email:
//                   </label>
//                   <input
//                     type="email"
//                     id="email"
//                     className="form-control"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                     placeholder="Enter your email"
//                   />
//                 </div>
//
//                 {/* Password Field */}
//                 <div className="mb-3">
//                   <label htmlFor="password" className="form-label">
//                     Password:
//                   </label>
//                   <input
//                     type="password"
//                     id="password"
//                     className="form-control"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                     placeholder="Enter your password"
//                   />
//                 </div>
//
//                 {/* Error Message */}
//                 {error && (
//                   <div className="alert alert-danger" role="alert">
//                     {error}
//                   </div>
//                 )}
//
//                 {/* Submit Button */}
//                 <div className="d-grid">
//                   <button type="submit" className="btn btn-primary">
//                     Login
//                   </button>
//                 </div>
//               </form>
//             </div>
//             <div className="card-footer text-muted text-center">
//               Don't have an account? <Link to="/register">Register here</Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
//
// export default Login;
