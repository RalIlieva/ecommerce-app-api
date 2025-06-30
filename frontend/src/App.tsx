import React, { useContext, useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
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
import VendorNavbar from './components/VendorNavbar';

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
import VendorProductDetail from './pages/vendor/VendorProductDetail';

// Simple global banner component
const GlobalBanner: React.FC<{ message: string; onClose: () => void }> = ({
  message,
  onClose,
}) => {
  if (!message) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        background: '#f8d7da',
        color: '#842029',
        padding: '1rem',
        textAlign: 'center',
        zIndex: 1000,
      }}
    >
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

// Wrap the Router so we can use useLocation() and useNavigate()
const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [bannerMsg, setBannerMsg] = useState<string>('');

  const isVendorRoute = location.pathname.startsWith('/vendor');

  // Show banner + delayed redirect only if an authenticated user expires
  useEffect(() => {
    const onExpired = () => {
      if (user) {
        setBannerMsg('Your session has expired. Redirecting to login…');
        setTimeout(() => {
          navigate(isVendorRoute ? '/vendor/login' : '/login', {
            replace: true,
          });
        }, 800);
      }
    };
    window.addEventListener('sessionExpired', onExpired);
    return () => window.removeEventListener('sessionExpired', onExpired);
  }, [user, isVendorRoute, navigate]);

  return (
    <>
      <GlobalBanner message={bannerMsg} onClose={() => setBannerMsg('')} />
      <div style={{ paddingTop: bannerMsg ? '3rem' : undefined }}>
        {isVendorRoute ? <VendorNavbar /> : <Navbar />}

        <Routes>
          {/* Customer routes (browsing allowed) */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route
            path="/products/products/:uuid/:slug"
            element={<ProductDetail />}
          />
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/tags" element={<TagList />} />
          <Route
            path="/categories/:slug"
            element={<ProductListByCategory />}
          />

          {/* Auth pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/password-reset"
            element={<PasswordResetRequest />}
          />
          <Route
            path="/password-reset-confirm/:uid/:token"
            element={<PasswordResetConfirm />}
          />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Customer purchase/account routes (login required via sessionExpired logic) */}
          <Route path="/profile/:uuid" element={<Profile />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/order/:order_uuid" element={<OrderPage />} />

          {/* Vendor login */}
          <Route path="/vendor/login" element={<VendorLogin />} />

          {/* Protected Vendor Routes */}
          <Route element={<VendorRoute />}>
            <Route
              path="/vendor/dashboard"
              element={<VendorDashboard />}
            />
            <Route
              path="/vendor/products"
              element={<VendorProductManagement />}
            />
            <Route
              path="/vendor/categories"
              element={<VendorCategories />}
            />
            <Route
              path="/vendor/tags"
              element={<VendorTags />}
            />
            <Route
              path="/vendor/orders"
              element={<VendorOrderManagement />}
            />
            <Route
              path="/vendor/orders/:order_uuid"
              element={<VendorOrderDetails />}
            />
            <Route
              path="/vendor/payments"
              element={<VendorPaymentManagement />}
            />
            <Route
              path="/vendor/products/:uuid/:slug"
              element={<VendorProductDetail />}
            />
          </Route>
        </Routes>
      </div>
    </>
  );
};

const App: React.FC = () => (
  <CartProvider>
    <WishlistProvider>
      <Router>
        <AppContent />
      </Router>
    </WishlistProvider>
  </CartProvider>
);

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