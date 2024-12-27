// frontend/src/components/Navbar.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCategories, Category } from '../api/categories';
import { fetchTags, Tag } from '../api/tags';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  // States for filters
  const [searchName, setSearchName] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');
  const [maxRating, setMaxRating] = useState<string>('');

  useEffect(() => {
    // Fetch categories and tags for dropdowns
    const fetchFilters = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          fetchCategories(),
          fetchTags(),
        ]);
        setCategories(categoriesData.results || categoriesData);
        setTags(tagsData.results || tagsData);
      } catch (error) {
        console.error('Failed to fetch categories and tags:', error);
      }
    };

    fetchFilters();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();

    if (searchName.trim() !== '') query.append('name', searchName.trim());
    if (selectedCategory !== '') query.append('category', selectedCategory);
    if (selectedTag !== '') query.append('tags', selectedTag);
    if (minPrice.trim() !== '') query.append('min_price', minPrice.trim());
    if (maxPrice.trim() !== '') query.append('max_price', maxPrice.trim());
    if (minRating.trim() !== '') query.append('min_avg_rating', minRating.trim());
    if (maxRating.trim() !== '') query.append('max_avg_rating', maxRating.trim());

    navigate(`/products?${query.toString()}`);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">E-Commerce</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarFilters" aria-controls="navbarFilters" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarFilters">
          <form className="d-flex flex-wrap align-items-center" onSubmit={handleSearch}>
            {/* Search Input */}
            <input
              type="text"
              className="form-control me-2 mb-2"
              placeholder="Search products..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />

            {/* Category Dropdown */}
            <select
              className="form-select me-2 mb-2"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.uuid} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Tag Dropdown */}
            <select
              className="form-select me-2 mb-2"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>

            {/* Min Price */}
            <input
              type="number"
              className="form-control me-2 mb-2"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min="0"
              step="0.01"
            />

            {/* Max Price */}
            <input
              type="number"
              className="form-control me-2 mb-2"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
              step="0.01"
            />

            {/* Min Rating */}
            <input
              type="number"
              className="form-control me-2 mb-2"
              placeholder="Min Rating"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              min="1"
              max="5"
            />

            {/* Max Rating */}
            <input
              type="number"
              className="form-control me-2 mb-2"
              placeholder="Max Rating"
              value={maxRating}
              onChange={(e) => setMaxRating(e.target.value)}
              min="1"
              max="5"
            />

            {/* Search Button */}
            <button type="submit" className="btn btn-outline-success mb-2">
              Search
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
