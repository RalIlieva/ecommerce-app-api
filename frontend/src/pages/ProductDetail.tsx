import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

interface ProductDetail {
  uuid: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  gallery?: string[];
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
            src={product.image || 'https://via.placeholder.com/500'}
            alt={product.name}
            className="img-fluid rounded mb-4"
            style={{ maxHeight: '500px', objectFit: 'cover' }}
          />
          <div className="d-flex flex-wrap">
            {product.gallery &&
              product.gallery.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Gallery ${index}`}
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
          <h5 className="text-primary">
            ${product.price ? parseFloat(product.price).toFixed(2) : 'N/A'}
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
