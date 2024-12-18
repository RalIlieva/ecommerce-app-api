// src/pages/ProductDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

interface ProductDetail {
  uuid: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  // Add other fields you need
}

const ProductDetail: React.FC = () => {
  const { uuid, slug } = useParams<{ uuid: string; slug: string }>(); // Get uuid and slug from URL
//   const { uuid, slug } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await api.get(`/products/products/${uuid}/${slug}/`);
        setProduct(response.data);
      } catch (err) {
        setError('Failed to fetch product details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (uuid && slug) {
      fetchProductDetail();
    }
  }, [uuid, slug]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  if (!product) return <p>Product not found.</p>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      {/* Display other product details */}
    </div>
  );
};

export default ProductDetail;
