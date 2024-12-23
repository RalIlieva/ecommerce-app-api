import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Home: React.FC = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-10 text-center">
          <h1 className="display-4 fw-bold text-primary">Welcome to the E-commerce App</h1>
          <p className="lead text-muted">Explore our wide range of products and find the best deals for you.</p>
          <div className="mt-4">
            {!user ? (
              <>
                <Link to="/login" className="btn btn-primary btn-lg me-3">
                  Login
                </Link>
                <Link to="/register" className="btn btn-outline-secondary btn-lg">
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link to="/products" className="btn btn-success btn-lg me-3">
                  View Products
                </Link>
                <button className="btn btn-danger btn-lg" onClick={logout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="row mt-5">
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-body text-center">
              <h5 className="card-title">Featured Products</h5>
              <p className="card-text text-muted">Check out our top-rated products of the season.</p>
              <Link to="/products" className="btn btn-primary">
                Shop Now
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-body text-center">
              <h5 className="card-title">Special Offers</h5>
              <p className="card-text text-muted">Don't miss our exclusive discounts and deals.</p>
              <Link to="/products" className="btn btn-primary">
                View Offers
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-body text-center">
              <h5 className="card-title">New Arrivals</h5>
              <p className="card-text text-muted">Discover the latest additions to our store.</p>
              <Link to="/products" className="btn btn-primary">
                Explore Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;


// // src/pages/Home.tsx
// import React, { useContext } from 'react';
// import { Link } from 'react-router-dom';
// import AuthContext from '../context/AuthContext';
//
// const Home: React.FC = () => {
//   const { user, logout } = useContext(AuthContext);
//
//   return (
//     <div>
//       <h1>Welcome to the E-commerce App</h1>
//       <p>Explore our range of products.</p>
//     </div>
//   );
// };
//
// export default Home;
