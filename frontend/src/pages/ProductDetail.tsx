// src/pages/ProductDetail.tsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

interface ProductImage {
  id: number;
  image: string; // Absolute URL
  alt_text: string;
  image_url: string; // Absolute URL
}

interface ProductDetail {
  uuid: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string; // Absolute URL
  stock: number;
  images: ProductImage[]; // Related images
  reviews: any[]; // Adjust based on actual review serializer
  average_rating: number;
  category: any; // Adjust based on actual category serializer
  tags: any[]; // Adjust based on actual tag serializer
}

const ProductDetail: React.FC = () => {
  const { uuid, slug } = useParams<{ uuid: string; slug: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await api.get(`/products/products/${uuid}/${slug}/`);
        console.log(response.data); // Inspect API response
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

  if (loading) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center mt-5">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container text-center mt-5">
        <p>Product not found.</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row gx-lg-5">
        {/* Product Image and Gallery */}
        <div className="col-md-6 mb-4">
        <img
            src={
                product.image ||
                (product.images && product.images.length > 0 ? product.images[0].image_url : 'https://via.placeholder.com/500')
            }
            alt={product.name || 'Product image'}
            className="img-fluid rounded mb-4"
            style={{ maxHeight: '500px', objectFit: 'cover' }}
        />


          <div className="d-flex flex-wrap">
            {product.images &&
              product.images.map((image) => (
                <img
                  key={image.id}
                  src={image.image_url} // Use absolute URL
                  alt={image.alt_text || `Gallery ${image.id}`}
                  className="img-thumbnail me-2 mb-2"
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
              ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="col-md-6">
          <h1 className="fw-bold">{product.name}</h1>
          <p className="text-muted">{product.description}</p>
          <p className={`text-muted ${product.stock > 0 ? 'text-success' : 'text-danger'}`}>
            {product.stock > 0 ? `In stock: ${product.stock}` : 'Out of stock'}
          </p>
          <h5 className="text-primary">
            ${product.price ? parseFloat(product.price.toString()).toFixed(2) : 'N/A'}
          </h5>
          <div className="mt-4">
            <label htmlFor="quantity" className="form-label">
              Quantity:
            </label>
            <input
              type="number"
              id="quantity"
              className="form-control w-25 mb-3"
              defaultValue={1}
              min={1}
            />
            <button className="btn btn-primary me-2">Add to Cart</button>
            <button className="btn btn-outline-danger">
              <i className="fas fa-heart"></i> Add to Wishlist
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-5">
        <h2>Customer Reviews</h2>
        <p className="text-muted">No reviews available yet. Be the first to review!</p>
      </div>
    </div>
  );
};

export default ProductDetail;
