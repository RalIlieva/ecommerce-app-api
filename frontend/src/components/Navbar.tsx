// src/components/Navbar.tsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useWishlistContext } from '../context/WishlistContext';
import { useCartContext } from '../context/CartContext';

const Navbar: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const { wishlistCount } = useWishlistContext();
  const { cartCount } = useCartContext();

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    setSearchTerm('');
  };

  const handleClearSearch = () => {
    navigate('/products');
    setSearchTerm('');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        {/* Brand */}
        <Link className="navbar-brand" to="/">
          E-Commerce
        </Link>

        {/* Toggler */}
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

        {/* Collapsible Content */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Left links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/products">
                Products
              </Link>
            </li>
            {user?.profile_uuid && (
              <li className="nav-item">
                <Link className="nav-link" to={`/profile/${user.profile_uuid}`}>
                  Profile
                </Link>
              </li>
            )}
          </ul>

          {/* Search + Auth Buttons Layout */}
          <div className="d-flex flex-wrap flex-lg-nowrap align-items-center justify-content-between w-100 gap-2">
            {/* Centered Search Form */}
            <div className="mx-auto">
              <form
                className="d-flex align-items-center flex-wrap flex-lg-nowrap justify-content-center"
                onSubmit={handleSearchSubmit}
                style={{ flexGrow: 1 }}
              >
                <input
                  className="form-control me-2"
                  type="search"
                  placeholder="Search by name..."
                  aria-label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  required
                  style={{ minWidth: '180px', maxWidth: '300px' }}
                />
                <button className="btn btn-outline-success me-2 mt-2 mt-lg-0" type="submit">
                  Search
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary mt-2 mt-lg-0"
                  onClick={handleClearSearch}
                >
                  Clear
                </button>
              </form>
            </div>

            {/* Right-side Buttons */}
            <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 ms-lg-3 mt-2 mt-lg-0">
              {!user ? (
                <>
                  <Link className="btn btn-primary" to="/login">
                    Login
                  </Link>
                  <Link className="btn btn-primary" to="/register">
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <button className="btn btn-danger" onClick={logout}>
                    Logout
                  </button>
                  <Link className="btn btn-warning position-relative" to="/wishlist">
                    <i className="fas fa-heart"></i> Wishlist
                    {wishlistCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.75rem' }}>
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
              <Link className="btn btn-warning position-relative" to="/cart">
                <i className="fas fa-shopping-cart"></i> Cart
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.75rem' }}>
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

// // Initial working version - almost perfect
// // src/components/Navbar.tsx
// import React, { useState, useContext } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import AuthContext from '../context/AuthContext';
// import { useWishlistContext } from '../context/WishlistContext';
// import { useCartContext } from '../context/CartContext';
//
// const Navbar: React.FC = () => {
//   const { user, logout } = useContext(AuthContext);
//   const navigate = useNavigate();
//
//   // Access the global wishlist/cart counts
//   const { wishlistCount } = useWishlistContext();
//   const { cartCount } = useCartContext();
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
//         <Link className="navbar-brand" to="/">
//           E-Commerce
//         </Link>
//
//         {/* Toggler for mobile view */}
//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarNav"
//           aria-controls="navbarNav"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>
//
//         {/* Navbar Links and Search */}
//         <div className="collapse navbar-collapse" id="navbarNav">
//           {/* Left-aligned Links */}
//           <ul className="navbar-nav me-auto mb-2 mb-lg-0">
//             <li className="nav-item">
//               <Link className="nav-link" to="/products">
//                 Products
//               </Link>
//             </li>
//             {user && user.profile_uuid && (
//               <li className="nav-item">
//                 <Link className="nav-link" to={`/profile/${user.profile_uuid}`}>
//                   Profile
//                 </Link>
//               </li>
//             )}
//           </ul>
//
//           {/* Centered Search Form */}
//           <form
//             className="d-flex mx-auto"
//             onSubmit={handleSearchSubmit}
//             style={{ maxWidth: '500px', width: '100%' }}
//           >
//             <input
//               className="form-control me-2"
//               type="search"
//               placeholder="Search by name..."
//               aria-label="Search"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               required
//             />
//             <button className="btn btn-outline-success" type="submit">
//               Search
//             </button>
//             <button
//               type="button"
//               className="btn btn-outline-secondary ms-2"
//               onClick={handleClearSearch}
//             >
//               Clear
//             </button>
//           </form>
//
//           {/* Right-aligned Authentication Links */}
//           <div className="d-flex">
//             {!user ? (
//               <>
//                 <Link className="btn btn-primary me-2" to="/login">
//                   Login
//                 </Link>
//                 <Link className="btn btn-primary me-2" to="/register">
//                   Register
//                 </Link>
//               </>
//             ) : (
//               <>
//                 <button className="btn btn-danger me-2" onClick={logout}>
//                   Logout
//                 </button>
//                 {/* Wishlist Link with badge */}
//                 <Link
//                   className="btn btn-warning me-2 position-relative"
//                   to="/wishlist"
//                 >
//                   <i className="fas fa-heart"></i> Wishlist
//                   {wishlistCount > 0 && (
//                     <span
//                       className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
//                       style={{ fontSize: '0.75rem' }}
//                     >
//                       {wishlistCount}
//                     </span>
//                   )}
//                 </Link>
//               </>
//             )}
//
//             {/* Cart Link with badge */}
//             <Link
//               className="btn btn-warning position-relative"
//               to="/cart"
//             >
//               <i className="fas fa-shopping-cart"></i> Cart
//               {cartCount > 0 && (
//                 <span
//                   className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
//                   style={{ fontSize: '0.75rem' }}
//                 >
//                   {cartCount}
//                 </span>
//               )}
//             </Link>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };
//
// export default Navbar;
