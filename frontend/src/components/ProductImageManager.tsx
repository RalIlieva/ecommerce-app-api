import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import api from '../api';

interface ProductImage {
  id: number;
  image_url: string;
}

interface Props {
  uuid: string;
  slug: string;
}

const ProductImageManager: React.FC<Props> = ({ uuid, slug }) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [newImage, setNewImage] = useState<File | null>(null);

  const fetchImages = async () => {
    try {
      const res = await api.get(`/products/products/${uuid}/${slug}/`);
      setImages(res.data.images || []);
    } catch (err) {
      console.error('Error loading images:', err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [uuid, slug]);

  const handleUpload = async () => {
    if (!newImage) return;
    const formData = new FormData();
    formData.append('image', newImage);

    try {
      await api.post(`/vendor/products/products/${uuid}/${slug}/upload-image/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewImage(null);
      fetchImages(); // Refresh images
    } catch (err) {
      console.error('Image upload error:', err);
    }
  };

  const handleDelete = async (imageId: number) => {
    try {
      await api.delete(`/vendor/products/products/{uuid}/${slug}/images/${imageId}/delete/`);
      setImages(images.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error('Delete image error:', err);
    }
  };

  return (
    <div className="mt-3">
      <Form.Group controlId="imageUpload">
        <Form.Label>Upload Product Image</Form.Label>
        <Form.Control type="file" onChange={(e) => setNewImage(e.target.files?.[0] || null)} />
      </Form.Group>
      <Button className="mt-2" onClick={handleUpload} disabled={!newImage}>
        Upload
      </Button>

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
              <Button size="sm" variant="outline-danger" onClick={() => handleDelete(img.id)}>
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
