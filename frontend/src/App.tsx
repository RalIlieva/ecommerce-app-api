import React, { useContext } from 'react'; // Add useContext import
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthContext from './context/AuthContext';
import Profile from './pages/Profile';

const App: React.FC = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <Router>
      <nav style={navStyle}>
        <ul style={ulStyle}>
          <li style={liStyle}><Link to="/">Home</Link></li>
          <li style={liStyle}><Link to="/products">Products</Link></li>
          {!user ? (
            <>
              <li style={liStyle}><Link to="/login">Login</Link></li>
              <li style={liStyle}><Link to="/register">Register</Link></li>
            </>
          ) : (
            <>
              {user.profile_uuid ? (
                <li style={liStyle}><Link to={`/profile/${user.profile_uuid}`}>Profile</Link></li>
              ) : (
                <li style={liStyle}>Profile Loading...</li>
              )}
              <li style={liStyle}><button onClick={logout} style={buttonStyle}>Logout</button></li>
            </>
          )}
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/products/:uuid/:slug" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:uuid" element={<Profile />} />
      </Routes>
    </Router>
  );
};

const navStyle: React.CSSProperties = { background: '#f0f0f0', padding: '10px' };
const ulStyle: React.CSSProperties = { listStyle: 'none', display: 'flex', gap: '20px', margin: 0, padding: 0 };
const liStyle: React.CSSProperties = { display: 'inline' };
const buttonStyle: React.CSSProperties = { border: 'none', background: 'none', cursor: 'pointer', color: 'blue' };

export default App;
