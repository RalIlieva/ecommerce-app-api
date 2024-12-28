// src/pages/Register.tsx
import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register: React.FC = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, name);
      // After successful registration, redirect to login
      navigate('/login');
    } catch (err: any) {
      setError('An error occurred during registration. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <h3 className="mb-0">Register</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleRegister}>
                {/* Name Field */}
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name:
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your name"
                  />
                </div>

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
                  <button type="submit" className="btn btn-success">
                    Register
                  </button>
                </div>
              </form>
            </div>
            <div className="card-footer text-muted text-center">
              Already have an account? <Link to="/login">Login here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;


// // src/pages/Register.tsx
// import React, { useState, useContext } from 'react';
// import AuthContext from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
//
// const Register: React.FC = () => {
//   const { register } = useContext(AuthContext);
//   const navigate = useNavigate();
//
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [name, setName] = useState('');
//   const [error, setError] = useState<string | null>(null);
//
//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await register(email, password, name);
//       // After successful registration, redirect to login
//       navigate('/login');
//     } catch (err: any) {
//       setError('An error occurred during registration. Please try again.');
//       console.error(err);
//     }
//   };
//
//   return (
//     <div>
//       <h1>Register</h1>
//       <form onSubmit={handleRegister}>
//         <div>
//           <label>Name:</label><br />
//           <input
//             type="text"
//             value={name}
//             onChange={e => setName(e.target.value)}
//             required
//           />
//         </div>
//         <div>
//           <label>Email:</label><br />
//           <input
//             type="email"
//             value={email}
//             onChange={e => setEmail(e.target.value)}
//             required
//           />
//         </div>
//         <div>
//           <label>Password:</label><br />
//           <input
//             type="password"
//             value={password}
//             onChange={e => setPassword(e.target.value)}
//             required
//           />
//         </div>
//         {error && <p style={{ color: 'red' }}>{error}</p>}
//         <button type="submit">Register</button>
//       </form>
//     </div>
//   );
// };
//
// export default Register;
