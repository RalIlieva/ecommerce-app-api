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

const App: React.FC = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <Router>
      <div>
        <Navbar />
{/*         <nav className="navbar navbar-expand-lg navbar-dark bg-dark"> */}
{/*           <div className="container"> */}
{/*             <Link className="navbar-brand" to="/">E-Commerce</Link> */}
{/*             <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation"> */}
{/*               <span className="navbar-toggler-icon"></span> */}
{/*             </button> */}
{/*             <div className="collapse navbar-collapse" id="navbarNav"> */}
{/*               <ul className="navbar-nav me-auto mb-2 mb-lg-0"> */}
{/*                 <li className="nav-item"> */}
{/*                   <Link className="nav-link" to="/products">Products</Link> */}
{/*                 </li> */}
{/*                 {user && user.profile_uuid && ( */}
{/*                   <li className="nav-item"> */}
{/*                     <Link className="nav-link" to={`/profile/${user.profile_uuid}`}>Profile</Link> */}
{/*                   </li> */}
{/*                 )} */}
{/*               </ul> */}
{/*               <div className="d-flex"> */}
{/*                 {!user ? ( */}
{/*                   <> */}
{/*                     <Link className="btn btn-primary me-2" to="/login">Login</Link> */}
{/*                     <Link className="btn btn-primary me-2" to="/register">Register</Link> */}
{/*                   </> */}
{/*                 ) : ( */}
{/*                   <> */}
{/*                     <button className="btn btn-danger me-2" onClick={logout}>Logout</button> */}
{/*                   </> */}
{/*                 )} */}
{/*                 <Link className="btn btn-warning" to="/cart"> */}
{/*                   <i className="fas fa-shopping-cart"></i> Cart */}
{/*                 </Link> */}
{/*               </div> */}
{/*             </div> */}
{/*           </div> */}
{/*         </nav> */}
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
        </Routes>
      </div>
    </Router>
  );
};

export default App;