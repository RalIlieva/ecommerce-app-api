import React, { useEffect, useState } from 'react';
import api from '../api';

interface Tag {
  uuid: string;
  name: string;
  slug: string;
}

const TagList: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products/tags/');
        setTags(response.data.results || response.data);
      } catch (err) {
        setError('Failed to fetch tags.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  if (loading) return <p>Loading Tags...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-5">
      <h2>All Tags</h2>
      <ul className="list-group">
        {tags.map((tag) => (
          <li key={tag.uuid} className="list-group-item">
            {tag.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TagList;
