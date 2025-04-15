// src/components/ProductImageManager.tsx
import React, { useEffect, useState } from 'react';
import { Button, Form, Alert, Spinner } from 'react-bootstrap';
import api from '../api';

interface ProductImageManagerProps {
  uuid: string;
  slug: string;
}

interface ProductImage {
  id: number;
  image_url: string;
}

const ProductImageManager: React.FC<ProductImageManagerProps> = ({ uuid, slug }) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/products/${uuid}/${slug}/`);
      setImages(res.data.images || []);
    } catch (err) {
      console.error('Error loading images:', err);
      setError('Failed to fetch product images.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uuid && slug) {
      fetchImages();
    }
  }, [uuid, slug]);

  const handleUpload = async () => {
    if (!newImage) return;
    const formData = new FormData();
    formData.append('image', newImage);

    try {
      setLoading(true);
      await api.post(`/vendor/products/products/${uuid}/${slug}/upload-image/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewImage(null);
      fetchImages();
    } catch (err) {
      console.error('Image upload error:', err);
      setError('Failed to upload image.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    try {
      await api.delete(`/vendor/products/products/${uuid}/${slug}/images/${imageId}/delete/`);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error('Delete image error:', err);
      setError('Failed to delete image.');
    }
  };

  return (
    <div className="mt-3">
      <Form.Group controlId="imageUpload">
        <Form.Label>Upload Product Image</Form.Label>
        <Form.Control type="file" onChange={(e) => setNewImage(e.target.files?.[0] || null)} />
      </Form.Group>
      <Button className="mt-2" onClick={handleUpload} disabled={!newImage || loading}>
        {loading ? <Spinner size="sm" animation="border" /> : 'Upload'}
      </Button>

      {error && <Alert variant="danger" className="mt-2">{error}</Alert>}

      <div className="d-flex flex-wrap mt-3">
        {images.map((img) => (
          <div key={img.id} className="me-3 mb-2 text-center">
            <img
              src={img.image_url}
              alt="product"
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              className="rounded"
            />
            <div>
              <Button
                size="sm"
                variant="outline-danger"
                onClick={() => handleDelete(img.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImageManager;
