import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../api';

interface Profile {
  profile_uuid: string;
  gender: string;
  phone_number: string;
  address: string;
  date_of_birth: string;
  about: string;
  user: {
    uuid: string;
    email: string;
    name: string;
  };
}

const Profile: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.profile_uuid) {
      fetchProfile(user.profile_uuid);
    }
  }, [user]);

  const fetchProfile = async (profileUUID: string) => {
    try {
      const response = await api.get(`/user/profile/${profileUUID}/`);
      setProfile(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch profile details.');
    }
  };

  if (!user) return <p>You must be logged in to view this page.</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!profile) return <p>Loading profile...</p>;

  return (
    <div>
      <h1>Your Profile</h1>
      <p>Profile UUID: {profile.profile_uuid}</p>
      <p>Name: {profile.user.name}</p>
      <p>Email: {profile.user.email}</p>
      <p>Gender: {profile.gender}</p>
      <p>Phone Number: {profile.phone_number}</p>
      <p>Address: {profile.address}</p>
      <p>Date of Birth: {profile.date_of_birth}</p>
      <p>About: {profile.about}</p>
    </div>
  );
};

export default Profile;
