import React, { useEffect, useState } from 'react';
import api from '../api';

interface Category {
  uuid: string;
  name: string;
  slug: string;
  parent?: string; // if needed
}

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products/categories/');
        // If your DRF returns pagination, might do response.data.results
        setCategories(response.data.results || response.data);
      } catch (err) {
        setError('Failed to fetch categories.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return <p>Loading Categories...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-5">
      <h2>All Categories</h2>
      <ul className="list-group">
        {categories.map((cat) => (
          <li key={cat.uuid} className="list-group-item">
            {cat.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryList;
