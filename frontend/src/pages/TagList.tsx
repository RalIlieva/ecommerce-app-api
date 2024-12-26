// src/pages/TagList/TagList.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTags, Tag } from '../api/tags';

const TagList: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTags = async () => {
      try {
        const data = await fetchTags();
        setTags(data.results || data);
      } catch (err) {
        setError('Failed to fetch tags.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getTags();
  }, []);

  if (loading)
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="container text-center mt-5">
        <p className="text-danger">{error}</p>
      </div>
    );

  return (
    <div className="container mt-5">
      <h2>All Tags</h2>
      <ul className="list-group">
        {tags.map((tag) => (
          <li key={tag.uuid} className="list-group-item d-flex justify-content-between align-items-center">
            {tag.name}
            {/* Implement similar product list by tag if needed */}
            {/* <Link to={`/tags/${tag.slug}`} className="btn btn-primary btn-sm">
              View Products
            </Link> */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TagList;
