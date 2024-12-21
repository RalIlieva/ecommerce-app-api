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
{/*       <ul> */}
{/*         <li><Link to="/products">View Products</Link></li> */}
{/*         {!user && ( */}
{/*           <> */}
{/*             <li><Link to="/register">Register</Link></li> */}
{/*             <li><Link to="/login">Login</Link></li> */}
{/*           </> */}
{/*         )} */}
{/*         {user && ( */}
{/*           <> */}
{/*             <li><Link to="/profile">Profile</Link></li> */}
{/*             <li><button onClick={logout}>Logout</button></li> */}
{/*           </> */}
{/*         )} */}
{/*       </ul> */}
    </div>
  );
};

export default Home;
