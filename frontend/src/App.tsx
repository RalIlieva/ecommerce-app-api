// src/App.tsx
import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import PasswordResetRequest from './components/PasswordResetRequest';
import PasswordResetConfirm from './components/PasswordResetConfirm';
import ChangePassword from './components/ChangePassword';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import OrderPage from './pages/OrderPage';

import AuthContext from './context/AuthContext';
import Navbar from './components/Navbar';

// Vendor pages
import VendorLogin from './pages/vendor/VendorLogin';
import VendorRoute from './components/VendorRoute';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProductManagement from './pages/vendor/VendorProductManagement';
import VendorTags from './pages/vendor/VendorTags';
import VendorCategories from './pages/vendor/VendorCategories';
import VendorOrderManagement from './pages/vendor/VendorOrderManagement';
import VendorOrderDetails from './pages/vendor/VendorOrderDetails';
import VendorPaymentManagement from './pages/vendor/VendorPaymentManagement';
import VendorCartAggregationManagement from './pages/vendor/VendorCartAggregationManagement';
import VendorWishlistAggregationManagement from './pages/vendor/VendorWishlistAggregationManagement';
import VendorProductDetail from './pages/vendor/VendorProductDetail';

// Simple global banner component
const GlobalBanner: React.FC<{
  message: string;
  onClose: () => void;
}> = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      background: '#f8d7da',
      color: '#842029',
      padding: '1rem',
      textAlign: 'center',
      zIndex: 1000,
    }}>
      {message}
      <button
        onClick={onClose}
        style={{
          marginLeft: '1rem',
          background: 'transparent',
          border: 'none',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        ×
      </button>
    </div>
  );
};

const App: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [bannerMsg, setBannerMsg] = useState<string>('');

  // Show banner, clear auth, then redirect based on current path
  const handleSessionExpired = (msg: string) => {
    setBannerMsg(msg);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    setTimeout(() => {
      // if current URL path starts with /vendor, go to vendor login
      if (window.location.pathname.startsWith('/vendor')) {
        window.location.href = '/vendor/login';
      } else {
        window.location.href = '/login';
      }
    }, 1500);
  };

  return (
    <CartProvider>
      <WishlistProvider>
        <Router>
          <GlobalBanner message={bannerMsg} onClose={() => setBannerMsg('')} />
          <div style={{ paddingTop: bannerMsg ? '3rem' : undefined }}>
            <Navbar />

            <Routes>
              {/* Customer routes */}
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
              <Route path="/order/:order_uuid" element={<OrderPage />} />

              {/* Vendor login */}
              <Route path="/vendor/login" element={<VendorLogin />} />

              {/* Protected Vendor Routes */}
              <Route element={<VendorRoute />}>
                <Route path="/vendor/dashboard" element={<VendorDashboard />} />

                <Route
                  path="/vendor/products"
                  element={
                    <VendorProductManagement onSessionExpired={handleSessionExpired} />
                  }
                />
                <Route path="/vendor/categories" element={<VendorCategories />} />
                <Route path="/vendor/tags" element={<VendorTags />} />

                <Route
                  path="/vendor/orders"
                  element={
                    <VendorOrderManagement onSessionExpired={handleSessionExpired} />
                  }
                />
                <Route
                  path="/vendor/orders/:order_uuid"
                  element={
                    <VendorOrderDetails onSessionExpired={handleSessionExpired} />
                  }
                />

                <Route path="/vendor/payments" element={<VendorPaymentManagement />} />
                <Route path="/vendor/cart/aggregation" element={<VendorCartAggregationManagement />} />
                <Route path="/vendor/wishlist/aggregation" element={<VendorWishlistAggregationManagement />} />

                <Route
                  path="/vendor/products/:uuid/:slug"
                  element={
                    <VendorProductDetail onSessionExpired={handleSessionExpired} />
                  }
                />
              </Route>
            </Routes>
          </div>
        </Router>
      </WishlistProvider>
    </CartProvider>
  );
};

export default App;

// // Initial version - working
// import React, { useContext } from 'react';
// import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
// import { CartProvider } from './context/CartContext';
// import { WishlistProvider } from './context/WishlistContext';
// import Home from './pages/Home';
// import Products from './pages/Products';
// import ProductDetail from './pages/ProductDetail';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Profile from './pages/Profile';
// import CategoryList from './pages/CategoryList';
// import TagList from './pages/TagList';
// import ProductListByCategory from './pages/ProductListByCategory';
// import AuthContext from './context/AuthContext';
// import Navbar from './components/Navbar';
// import PasswordResetRequest from './components/PasswordResetRequest';
// import PasswordResetConfirm from './components/PasswordResetConfirm';
// import ChangePassword from './components/ChangePassword';
// import CartPage from './pages/CartPage';
// import CheckoutPage from './pages/CheckoutPage';
// import WishlistPage from './pages/WishlistPage';
// import OrderPage from './pages/OrderPage';
//
// // // Vendor pages
// import VendorLogin from './pages/vendor/VendorLogin';
// import VendorRoute from './components/VendorRoute';
// import VendorDashboard from './pages/vendor/VendorDashboard';
// import VendorProductManagement from './pages/vendor/VendorProductManagement';
// import VendorTags from './pages/vendor/VendorTags';
// import VendorCategories from './pages/vendor/VendorCategories'
// import VendorOrderManagement from './pages/vendor/VendorOrderManagement';
// import VendorOrderDetails from './pages/vendor/VendorOrderDetails';
// import VendorPaymentManagement from './pages/vendor/VendorPaymentManagement';
// import VendorCartAggregationManagement from "./pages/vendor/VendorCartAggregationManagement";
// import VendorWishlistAggregationManagement from './pages/vendor/VendorWishlistAggregationManagement';
// import VendorProductDetail from './pages/vendor/VendorProductDetail';
//
//
// const App: React.FC = () => {
//   const { user, logout } = useContext(AuthContext);
//
//   return (
//   <CartProvider>
//     <WishlistProvider>
//         <Router>
//             <div>
//                 <Navbar />
//                 <Routes>
//                     <Route path="/" element={<Home />} />
//                     <Route path="/products" element={<Products />} />
//                     <Route path="/products/products/:uuid/:slug" element={<ProductDetail />} />
//                     <Route path="/login" element={<Login />} />
//                     <Route path="/register" element={<Register />} />
//                     <Route path="/profile/:uuid" element={<Profile />} />
//                     <Route path="/categories" element={<CategoryList />} />
//                     <Route path="/tags" element={<TagList />} />
//                     <Route path="/categories/:slug" element={<ProductListByCategory />} />
//                     <Route path="/password-reset" element={<PasswordResetRequest />} />
//                     <Route path="/password-reset-confirm/:uid/:token" element={<PasswordResetConfirm />} />
//                     <Route path="/change-password" element={<ChangePassword />} />
//                     <Route path="/cart" element={<CartPage />} />
//                     <Route path="/checkout" element={<CheckoutPage />} />
//                     <Route path="/wishlist" element={<WishlistPage />} />
//                     <Route path="/order/:order_uuid" element={<OrderPage />} />
//
//                     {/* Vendor routes */}
//                     <Route path="/vendor/login" element={<VendorLogin />} />
//
//                     {/* Vendor-related routes with VendorRoute for protection */}
//                     <Route element={<VendorRoute />}>
//                            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
//                            <Route path="/vendor/products" element={<VendorProductManagement />} />
//                             <Route path="/vendor/categories" element={<VendorCategories />} />
//                             <Route path="/vendor/tags" element={<VendorTags />} />
//                             <Route path="/vendor/orders" element={<VendorOrderManagement />} />
//                             <Route path="/vendor/orders/:order_uuid" element={<VendorOrderDetails />} />
//                             <Route path="/vendor/payments" element={<VendorPaymentManagement />} />
//                             <Route path="/vendor/cart/aggregation" element={<VendorCartAggregationManagement />} />
//                             <Route path="/vendor/wishlist/aggregation" element={<VendorWishlistAggregationManagement />} />
//                             <Route path="/vendor/products/:uuid/:slug" element={<VendorProductDetail />} />
//                     </Route>
//                 </Routes>
//             </div>
//         </Router>
//     </WishlistProvider>
//   </CartProvider>
//   );
// };
//
// export default App;