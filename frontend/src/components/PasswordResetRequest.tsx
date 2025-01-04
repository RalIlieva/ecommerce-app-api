// src/components/PasswordResetRequest.tsx
import React, { useState } from 'react';
import api from '../api'; // Ensure you have an API utility for making requests
import { Link } from 'react-router-dom';

const PasswordResetRequest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/users/reset_password/', { email });
      setSuccess('If the email exists, a password reset link has been sent.');
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('An error occurred. Please try again later.');
      setSuccess(null);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Password Reset</h2>
      <form onSubmit={handlePasswordResetRequest}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Enter your email address:
          </label>
          <input
            type="email"
            id="email"
            className="form-control"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your-email@example.com"
          />
        </div>
        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary">
          Send Reset Link
        </button>
      </form>
      <div className="mt-3">
        <Link to="/login">Back to Login</Link>
      </div>
    </div>
  );
};

export default PasswordResetRequest;
