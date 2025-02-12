import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
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
import ChangePassword from './components/ChangePassword';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import OrderPage from './pages/OrderPage';

const App: React.FC = () => {
  const { user, logout } = useContext(AuthContext);

  return (
  <CartProvider>
    <WishlistProvider>
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
                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/order" element={<OrderPage />} />
                </Routes>
            </div>
        </Router>
    </WishlistProvider>
  </CartProvider>
  );
};

export default App;