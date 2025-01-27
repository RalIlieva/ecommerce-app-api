// src/components/ProductGrid.tsx
import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '../api/types';

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  if (products.length === 0) {
    return <p>No products found.</p>;
  }

  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
      {products.map((product) => (
        <div className="col" key={product.uuid}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
