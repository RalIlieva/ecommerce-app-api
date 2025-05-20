import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const VendorNavbar: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Only render for authenticated vendors
  if (!user || !user.groups?.includes('vendor')) return null;

  const handleLogout = () => {
    logout();
    navigate('/vendor/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-secondary">
      <div className="container-fluid">
        {/* Branding */}
        <Link className="navbar-brand" to="/vendor/products">
          E-Commerce Vendor Panel
        </Link>

        {/* Toggler */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#vendorNavbarNav"
          aria-controls="vendorNavbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible Content */}
        <div className="collapse navbar-collapse" id="vendorNavbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/vendor/products">
                Products
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/vendor/orders">
                Orders
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/vendor/payments">
                Payments
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/vendor/categories">
                Categories
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/vendor/tags">
                Tags
              </Link>
            </li>
          </ul>

          {/* User dropdown & Logout */}
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="vendorUserMenu"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {user.email}
              </a>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="vendorUserMenu">
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default VendorNavbar;

// import React, { useContext } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import AuthContext from '../context/AuthContext';
//
// const VendorNavbar: React.FC = () => {
//   const { user, logout } = useContext(AuthContext);
//   const navigate = useNavigate();
//
//   // Only render for authenticated vendors
//   if (!user || !user.groups?.includes('vendor')) return null;
//
//   const handleLogout = () => {
//     logout();
//     navigate('/vendor/login');
//   };
//
//   return (
//     <nav className="navbar navbar-expand-lg navbar-dark bg-secondary">
//       <div className="container-fluid">
//         {/* Branding */}
//         <Link className="navbar-brand" to="/vendor/dashboard">
//           E-Commerce Vendor Panel
//         </Link>
//
//         {/* Toggler */}
//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#vendorNavbarNav"
//           aria-controls="vendorNavbarNav"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>
//
//         {/* Collapsible Content */}
//         <div className="collapse navbar-collapse" id="vendorNavbarNav">
//           <ul className="navbar-nav me-auto mb-2 mb-lg-0">
//             <li className="nav-item">
//               <Link className="nav-link" to="/vendor/dashboard">
//                 Dashboard
//               </Link>
//             </li>
//             <li className="nav-item">
//               <Link className="nav-link" to="/vendor/products">
//                 Products
//               </Link>
//             </li>
//             <li className="nav-item">
//               <Link className="nav-link" to="/vendor/orders">
//                 Orders
//               </Link>
//             </li>
//             <li className="nav-item">
//               <Link className="nav-link" to="/vendor/payments">
//                 Payments
//               </Link>
//             </li>
//             <li className="nav-item">
//               <Link className="nav-link" to="/vendor/cart/aggregation">
//                 Cart Aggregation
//               </Link>
//             </li>
//             <li className="nav-item">
//               <Link className="nav-link" to="/vendor/wishlist/aggregation">
//                 Wishlist Aggregation
//               </Link>
//             </li>
//             <li className="nav-item">
//               <Link className="nav-link" to="/vendor/tags">
//                 Tags & Categories
//               </Link>
//             </li>
//           </ul>
//
//           {/* User dropdown & Logout */}
//           <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
//             <li className="nav-item dropdown">
//               <a
//                 className="nav-link dropdown-toggle"
//                 href="#"
//                 id="vendorUserMenu"
//                 role="button"
//                 data-bs-toggle="dropdown"
//                 aria-expanded="false"
//               >
//                 {user.email}
//               </a>
//               <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="vendorUserMenu">
//                 <li>
//                   <button className="dropdown-item" onClick={handleLogout}>
//                     Logout
//                   </button>
//                 </li>
//               </ul>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// };
//
// export default VendorNavbar;
