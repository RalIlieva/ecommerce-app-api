import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CategoryList from './pages/CategoryList';
import TagList from './pages/TagList';
import ProductListByCategory from './pages/ProductListByCategory';
import AuthContext from './context/AuthContext';
import Navbar from './components/Navbar';
import PasswordResetRequest from './components/PasswordResetRequest';
import PasswordResetConfirm from './components/PasswordResetConfirm';

const App: React.FC = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/products/:uuid/:slug" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile/:uuid" element={<Profile />} />
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/tags" element={<TagList />} />
          <Route path="/categories/:slug" element={<ProductListByCategory />} />
          <Route path="/password-reset" element={<PasswordResetRequest />} />
          <Route path="/password-reset-confirm/:uid/:token" element={<PasswordResetConfirm />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;