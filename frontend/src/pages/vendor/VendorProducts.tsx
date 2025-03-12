// src/pages/vendor/VendorProducts.tsx
import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Product } from '../../types';

const VendorProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorProducts = async () => {
      try {
        // Adjust this endpoint to match your DRF vendor product list URL.
        const response = await api.get('/vendor/products/');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching vendor products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorProducts();
  }, []);

  if (loading) return <p>Loading products...</p>;

  return (
    <div>
      <h1>Your Products</h1>
      {products.length === 0 ? (
        <p>You have not added any products yet.</p>
      ) : (
        <ul>
          {products.map((prod) => (
            <li key={prod.uuid}>
              {prod.name} - ${prod.price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VendorProducts;
