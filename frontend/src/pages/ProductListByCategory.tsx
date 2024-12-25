// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Products from '../pages/Products';
import ProductDetail from '../pages/ProductDetail';
import CategoryList from '../pages/CategoryList';
import ProductListByCategory from '../pages/ProductListByCategory';
import TagList from '../pages/TagList'; //
import AuthProvider from '../context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/products/:uuid/:slug" element={<ProductDetail />} />
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/categories/:slug" element={<ProductListByCategory />} />
          {/* Add other routes as needed */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
