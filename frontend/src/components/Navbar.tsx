// src/components/Navbar.tsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

// 1) Import the contexts for wishlist & cart
import { useWishlistContext } from '../context/WishlistContext';
import { useCartContext } from '../context/CartContext';

const Navbar: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // 2) Access the global wishlist/cart counts
  const { wishlistCount } = useWishlistContext();
  const { cartCount } = useCartContext();

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to the Products page with the search query parameter
    navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    setSearchTerm('');
  };

  const handleClearSearch = () => {
    // Navigate to the Products page without any search query
    navigate('/products');
    setSearchTerm('');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand" to="/">
          E-Commerce
        </Link>

        {/* Toggler for mobile view */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links and Search */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Left-aligned Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/products">
                Products
              </Link>
            </li>
            {user && user.profile_uuid && (
              <li className="nav-item">
                <Link className="nav-link" to={`/profile/${user.profile_uuid}`}>
                  Profile
                </Link>
              </li>
            )}
          </ul>

          {/* Centered Search Form */}
          <form
            className="d-flex mx-auto"
            onSubmit={handleSearchSubmit}
            style={{ maxWidth: '500px', width: '100%' }}
          >
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search by name..."
              aria-label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              required
            />
            <button className="btn btn-outline-success" type="submit">
              Search
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary ms-2"
              onClick={handleClearSearch}
            >
              Clear
            </button>
          </form>

          {/* Right-aligned Authentication Links */}
          <div className="d-flex">
            {!user ? (
              <>
                <Link className="btn btn-primary me-2" to="/login">
                  Login
                </Link>
                <Link className="btn btn-primary me-2" to="/register">
                  Register
                </Link>
              </>
            ) : (
              <>
                <button className="btn btn-danger me-2" onClick={logout}>
                  Logout
                </button>
                {/* Wishlist Link with badge */}
                <Link
                  className="btn btn-warning me-2 position-relative"
                  to="/wishlist"
                >
                  <i className="fas fa-heart"></i> Wishlist
                  {wishlistCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: '0.75rem' }}
                    >
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* Cart Link with badge */}
            <Link
              className="btn btn-warning position-relative"
              to="/cart"
            >
              <i className="fas fa-shopping-cart"></i> Cart
              {cartCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: '0.75rem' }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;




// // src/components/Navbar.tsx
// import React, { useState, useContext } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import AuthContext from '../context/AuthContext';
//
// const Navbar: React.FC = () => {
//   const { user, logout } = useContext(AuthContext);
//   const navigate = useNavigate();
//
//   const [searchTerm, setSearchTerm] = useState('');
//
//   const handleSearchSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Navigate to the Products page with the search query parameter
//     navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
//     setSearchTerm('');
//   };
//
//   const handleClearSearch = () => {
//     // Navigate to the Products page without any search query
//     navigate('/products');
//     setSearchTerm('');
//   };
//
//   return (
//     <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
//       <div className="container">
//         {/* Brand */}
//         <Link className="navbar-brand" to="/">E-Commerce</Link>
//
//         {/* Toggler for mobile view */}
//         <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
//                 aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
//           <span className="navbar-toggler-icon"></span>
//         </button>
//
//         {/* Navbar Links and Search */}
//         <div className="collapse navbar-collapse" id="navbarNav">
//           {/* Left-aligned Links */}
//           <ul className="navbar-nav me-auto mb-2 mb-lg-0">
//             <li className="nav-item">
//               <Link className="nav-link" to="/products">Products</Link>
//             </li>
//             {user && user.profile_uuid && (
//               <li className="nav-item">
//                 <Link className="nav-link" to={`/profile/${user.profile_uuid}`}>Profile</Link>
//               </li>
//             )}
//           </ul>
//
//           {/* Centered Search Form */}
//           <form className="d-flex mx-auto" onSubmit={handleSearchSubmit} style={{ maxWidth: '500px', width: '100%' }}>
//             <input
//               className="form-control me-2"
//               type="search"
//               placeholder="Search by name..."
//               aria-label="Search"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               required
//             />
//             <button className="btn btn-outline-success" type="submit">Search</button>
//             <button type="button" className="btn btn-outline-secondary ms-2" onClick={handleClearSearch}>
//               Clear
//             </button>
//           </form>
//
//           {/* Right-aligned Authentication Links */}
//           <div className="d-flex">
//             {!user ? (
//               <>
//                 <Link className="btn btn-primary me-2" to="/login">Login</Link>
//                 <Link className="btn btn-primary me-2" to="/register">Register</Link>
//               </>
//             ) : (
//               <>
//                 <button className="btn btn-danger me-2" onClick={logout}>Logout</button>
//                 {/* Wishlist Link */}
//                 <Link className="btn btn-warning me-2" to="/wishlist">
//                   <i className="fas fa-heart"></i> Wishlist
//                 </Link>
//               </>
//             )}
//             <Link className="btn btn-warning" to="/cart">
//               <i className="fas fa-shopping-cart"></i> Cart
//             </Link>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };
//
// export default Navbar;
