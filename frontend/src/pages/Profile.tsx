// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

const Profile: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/users/profile/${uuid}/`);
        setProfile(response.data);
      } catch (err: any) {
        setError('Failed to load profile.');
        console.error(err);
      }
    };

    fetchProfile();
  }, [uuid]);

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  return (
    <div>
      <h1>Profile</h1>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      {/* Add more fields as needed */}
    </div>
  );
};

export default Profile;
