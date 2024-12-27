// src/components/Navbar.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [searchName, setSearchName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    const query = new URLSearchParams();
    if (searchName) query.append('name', searchName);
    if (selectedCategory) query.append('category', selectedCategory);
    navigate(`/products?${query.toString()}`);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      {/* Existing Navbar Content */}
      <div className="container">
        <Link className="navbar-brand" to="/">E-Commerce</Link>
        {/* ...other links */}
        <div className="d-flex">
          {/* Search Input */}
          <input
            type="text"
            className="form-control me-2"
            placeholder="Search products..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          {/* Category Filter */}
          <select
            className="form-select me-2"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {/* Map through categories */}
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            {/* Add dynamically if possible */}
          </select>
          {/* Search Button */}
          <button className="btn btn-outline-success" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
