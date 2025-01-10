// // components/PasswordResetConfirm.jsx
// import { useParams } from 'react-router-dom';
// import { useState } from 'react';
// import axios from 'axios';
//
// function PasswordResetConfirm() {
//   const { uid, token } = useParams();
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [message, setMessage] = useState('');
//
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (newPassword !== confirmPassword) {
//       setMessage('Passwords do not match.');
//       return;
//     }
//
//     try {
//       await axios.post('http://localhost:8000/api/v1/auth/password-reset-confirm/', {
//         uid,
//         token,
//         new_password: newPassword,
//         re_new_password: confirmPassword,
//       });
//       setMessage('Password has been reset successfully.');
//     } catch (error) {
//       setMessage('An error occurred. Please try again.');
//     }
//   };
//
//   return (
//     <div>
//       <h2>Reset Your Password</h2>
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label>New Password:</label>
//           <input
//             type="password"
//             value={newPassword}
//             onChange={(e) => setNewPassword(e.target.value)}
//             required
//           />
//         </div>
//         <div>
//           <label>Confirm Password:</label>
//           <input
//             type="password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             required
//           />
//         </div>
//         <button type="submit">Reset Password</button>
//       </form>
//       {message && <p>{message}</p>}
//     </div>
//   );
// }
//
// export default PasswordResetConfirm;


// src/components/PasswordResetConfirm.tsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

const PasswordResetConfirm: React.FC = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setSuccess(null);
      return;
    }
    try {
      await api.post('/auth/users/reset_password_confirm/', {
        uid,
        token,
        new_password: newPassword,
      });
      setSuccess('Your password has been reset successfully.');
      setError(null);
      // Optionally, redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setError('Invalid link or the link has expired.');
      setSuccess(null);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Reset Your Password</h2>
      <form onSubmit={handlePasswordResetConfirm}>
        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label">
            New Password:
          </label>
          <input
            type="password"
            id="newPassword"
            className="form-control"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm New Password:
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="form-control"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
        </div>
        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary">
          Reset Password
        </button>
      </form>
      <div className="mt-3">
        <Link to="/login">Back to Login</Link>
      </div>
    </div>
  );
};

export default PasswordResetConfirm;
