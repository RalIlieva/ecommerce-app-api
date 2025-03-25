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

// // Vendor pages
import VendorLogin from './pages/vendor/VendorLogin';
import VendorRoute from './components/VendorRoute';
import VendorDashboard from './pages/vendor/VendorDashboard';
// import VendorProducts from './pages/vendor/VendorProducts';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorProductManagement from './pages/vendor/VendorProductManagement';
import VendorTags from './pages/vendor/VendorTags';
import VendorCategories from './pages/vendor/VendorCategories'


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
                    <Route path="/order/:order_uuid" element={<OrderPage />} />

                    {/* Vendor routes */}
                    <Route path="/vendor/login" element={<VendorLogin />} />

                    {/* Wrap vendor-related routes with VendorRoute for protection */}
                    <Route element={<VendorRoute />}>
                           <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                           <Route path="/vendor/products" element={<VendorProductManagement />} />
{/*                            <Route path="/vendor/products" element={<VendorProducts />} /> */}
                            <Route path="/vendor/orders" element={<VendorOrders />} />
                            <Route path="/vendor/categories" element={<VendorCategories />} />
                            <Route path="/vendor/tags" element={<VendorTags />} />
                    </Route>

{/*                     <Route path="/vendor" element={<VendorRoute />}> */}
{/*                         <Route path="dashboard" element={<VendorDashboard />} /> */}
{/*                         <Route path="products" element={<VendorProducts />} /> */}
{/*                         <Route path="orders" element={<VendorOrders />} /> */}
{/*                     </Route> */}

                </Routes>
            </div>
        </Router>
    </WishlistProvider>
  </CartProvider>
  );
};

export default App;