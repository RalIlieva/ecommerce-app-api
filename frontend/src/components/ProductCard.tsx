// src/components/ProductCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../api/types'; // interface
import { renderStars } from '../utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="card h-100">
      <div className="card-img-top overflow-hidden" style={{ height: '200px' }}>
        <Link to={`/products/products/${product.uuid}/${product.slug}`}>
          <img
            src={product.image || 'https://via.placeholder.com/300'}
            className="img-fluid"
            alt={product.name}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </Link>
      </div>
      <div className="card-body">
        <h5 className="card-title">
          <Link
            to={`/products/products/${product.uuid}/${product.slug}`}
            className="text-decoration-none text-dark"
          >
            {product.name}
          </Link>
        </h5>
        <p className="card-text text-muted">Brand: {product.brand}</p>
        <p className="card-text">Category: {product.category?.name}</p>
        <p className="card-text">
          Tags:{' '}
          {product.tags.map((tag) => (
            <span key={tag.uuid} className="badge bg-secondary me-1">
              {tag.name}
            </span>
          ))}
        </p>
        <h6 className="card-text text-primary">${product.price}</h6>

        {product.average_rating !== null && product.average_rating !== undefined && (
          <div className="my-2">
            {renderStars(product.average_rating)}
            <span className="ms-2">{product.average_rating.toFixed(1)}/5</span>
          </div>
        )}
      </div>
      <div className="card-footer bg-transparent">
        <div className="d-flex justify-content-between">
          <button className="btn btn-primary">Add to Cart</button>
          <button className="btn btn-outline-danger">
            <i className="fas fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
