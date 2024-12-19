// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';

const App: React.FC = () => {
  return (
    <Router>
      <nav style={navStyle}>
        <ul style={ulStyle}>
          <li style={liStyle}><Link to="/">Home</Link></li>
          <li style={liStyle}><Link to="/products">Products</Link></li>
          <li style={liStyle}><Link to="/login">Login</Link></li>
          <li style={liStyle}><Link to="/register">Register</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/products/:uuid/:slug" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Add a simple Profile page route */}
        <Route path="/profile" element={<p>Protected Profile Page</p>} />
      </Routes>
    </Router>
  );
};

const navStyle: React.CSSProperties = {
  background: '#f0f0f0',
  padding: '10px',
};

const ulStyle: React.CSSProperties = {
  listStyle: 'none',
  display: 'flex',
  gap: '20px',
  margin: 0,
  padding: 0,
};

const liStyle: React.CSSProperties = {
  display: 'inline',
};

export default App;

// // src/App.tsx
// import React from 'react';
// import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
// import Home from './pages/Home';
// import Products from './pages/Products';
// import ProductDetail from './pages/ProductDetail';
// import Login from './pages/Login';
//
// const App: React.FC = () => {
//   return (
//     <Router>
//       <nav style={navStyle}>
//         <ul style={ulStyle}>
//           <li style={liStyle}><Link to="/">Home</Link></li>
//           <li style={liStyle}><Link to="/products">Products</Link></li>
//           <li style={liStyle}><Link to="/login">Login</Link></li>
//         </ul>
//       </nav>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/products" element={<Products />} />
//         <Route path="/products/products/:uuid/:slug" element={<ProductDetail />} />
//         <Route path="/login" element={<Login />} />
//       </Routes>
//     </Router>
//   );
// };
//
// // Basic styling
// const navStyle: React.CSSProperties = {
//   background: '#f0f0f0',
//   padding: '10px',
// };
//
// const ulStyle: React.CSSProperties = {
//   listStyle: 'none',
//   display: 'flex',
//   gap: '20px',
//   margin: 0,
//   padding: 0,
// };
//
// const liStyle: React.CSSProperties = {
//   display: 'inline',
// };
//
// export default App;
