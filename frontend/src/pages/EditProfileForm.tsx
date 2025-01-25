// src/components/EditProfileForm.tsx

import React, { useState } from 'react';
import api from '../api';
import { Profile } from './Profile';

interface EditProfileFormProps {
  profile: Profile;
  onCancel: () => void;
  onUpdate: (updatedProfile: Profile) => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ profile, onCancel, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: profile.user.name || '', // Initialize name from profile
    gender: profile.gender || '',
    phone_number: profile.phone_number || '',
    address: profile.address || '',
    date_of_birth: profile.date_of_birth || '',
    about: profile.about || '',
  });

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    setFieldErrors({});

  // Prepare payload with only changed fields
  const payload: any = {};

  // Only include fields that have been changed
  if (formData.name !== profile.user.name) {
    payload.user = { name: formData.name || null }; // Include name under user if changed
  }
  if (formData.gender !== profile.gender) {
    payload.gender = formData.gender || null;
  }
  if (formData.phone_number !== profile.phone_number) {
    payload.phone_number = formData.phone_number || null;
  }
  if (formData.address !== profile.address) {
    payload.address = formData.address || null;
  }
  if (formData.date_of_birth !== profile.date_of_birth) {
    payload.date_of_birth = formData.date_of_birth || null;
  }
  if (formData.about !== profile.about) {
    payload.about = formData.about || null;
  }

    // Log the payload for debugging
    console.log('Submitting form data:', payload);

    try {
      const response = await api.patch(`/user/profile/${profile.profile_uuid}/`, payload);
      onUpdate(response.data);
      setSuccessMessage('Profile updated successfully!');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      if (err.response && err.response.data) {
        console.error('Error details:', err.response.data);

        // Determine if error details are nested under 'detail'
        const errorData = err.response.data.detail || err.response.data;

        const fieldErrorsTemp: { [key: string]: string } = {};

        Object.entries(errorData).forEach(([field, messages]: [string, any]) => {
          if (Array.isArray(messages)) {
            fieldErrorsTemp[field] = messages.join(', ');
          } else if (typeof messages === 'string') {
            fieldErrorsTemp[field] = messages;
          } else {
            fieldErrorsTemp[field] = JSON.stringify(messages);
          }
        });

        setFieldErrors(fieldErrorsTemp);
        setError('Please fix the highlighted errors and try again.');
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card">
          <div className="card-header bg-secondary text-white">
            <h4 className="mb-0">Edit Profile</h4>
          </div>
          <div className="card-body">
            {successMessage && <p className="text-success">{successMessage}</p>}
            {error && <p className="text-danger">{error}</p>}
            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                />
                {fieldErrors.name && <div className="invalid-feedback">{fieldErrors.name}</div>}
              </div>

              {/* Gender */}
              <div className="mb-3">
                <label htmlFor="gender" className="form-label">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  className={`form-select ${fieldErrors.gender ? 'is-invalid' : ''}`}
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="m">Male</option>
                  <option value="f">Female</option>
                  <option value="o">Other</option>
                </select>
                {fieldErrors.gender && <div className="invalid-feedback">{fieldErrors.gender}</div>}
              </div>

              {/* Phone Number */}
              <div className="mb-3">
                <label htmlFor="phone_number" className="form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  className={`form-control ${fieldErrors.phone_number ? 'is-invalid' : ''}`}
                  value={formData.phone_number}
                  onChange={handleChange}
                />
                {fieldErrors.phone_number && (
                  <div className="invalid-feedback">{fieldErrors.phone_number}</div>
                )}
              </div>

              {/* Address */}
              <div className="mb-3">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className={`form-control ${fieldErrors.address ? 'is-invalid' : ''}`}
                  value={formData.address}
                  onChange={handleChange}
                />
                {fieldErrors.address && (
                  <div className="invalid-feedback">{fieldErrors.address}</div>
                )}
              </div>

              {/* Date of Birth */}
              <div className="mb-3">
                <label htmlFor="date_of_birth" className="form-label">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  className={`form-control ${fieldErrors.date_of_birth ? 'is-invalid' : ''}`}
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
                {fieldErrors.date_of_birth && (
                  <div className="invalid-feedback">{fieldErrors.date_of_birth}</div>
                )}
              </div>

              {/* About */}
              <div className="mb-3">
                <label htmlFor="about" className="form-label">
                  About
                </label>
                <textarea
                  id="about"
                  name="about"
                  className={`form-control ${fieldErrors.about ? 'is-invalid' : ''}`}
                  rows={3}
                  value={formData.about}
                  onChange={handleChange}
                ></textarea>
                {fieldErrors.about && <div className="invalid-feedback">{fieldErrors.about}</div>}
              </div>

              {/* Buttons */}
              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileForm;
