// src/pages/Home.tsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Home: React.FC = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div>
      <h1>Welcome to the E-commerce App</h1>
      <p>Explore our range of products.</p>
    </div>
  );
};

export default Home;
