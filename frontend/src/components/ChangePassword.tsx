// src/components/ChangePassword.tsx
import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const ChangePassword: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (newPassword !== confirmPassword) {
    setError('New passwords do not match.');
    setSuccess(null);
    return;
  }

  if (!user) {
    setError('User is not authenticated.');
    return;
  }

  try {
    await api.post('/user/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    setSuccess('Password changed successfully.');
    setError(null);

    // Redirect to profile using the profile's UUID
      setTimeout(() => {
        if (user?.profile_uuid) {
          navigate(`/profile/${user.profile_uuid}`);
        } else {
          console.error('Profile UUID not found.');
        }
      }, 1500); // Optional delay to show the success message
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.error || 'An error occurred.';
      setError(message);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="oldPassword" className="form-label">
            Current Password:
          </label>
          <input
            type="password"
            id="oldPassword"
            className="form-control"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            placeholder="Enter current password"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label">
            New Password:
          </label>
          <input
            type="password"
            id="newPassword"
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
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
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm new password"
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <button type="submit" className="btn btn-primary">
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
