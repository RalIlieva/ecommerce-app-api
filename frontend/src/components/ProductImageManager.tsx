// src/components/ProductImageManager.tsx

import React, { useState, useEffect } from 'react';
import { Button, Form, Card, Col, Row, Modal, Alert } from 'react-bootstrap';
import api from '../../api';

interface ProductImageManagerProps {
  uuid: string;
  slug: string;
  isEditMode?: boolean;
}

const ProductImageManager: React.FC<ProductImageManagerProps> = ({ uuid, slug, isEditMode = false }) => {
  const [images, setImages] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<any | null>(null);

  useEffect(() => {
    if (uuid && slug) {
      fetchImages();
    }
  }, [uuid, slug]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/vendor/products/products/${uuid}/${slug}/images/`);
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to fetch images.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('image', files[i]);
      }
      try {
        setLoading(true);
        await api.post(`/vendor/products/products/${uuid}/${slug}/upload-images/`, formData);
        fetchImages();
      } catch (error) {
        console.error('Error uploading images:', error);
        setError('Failed to upload images.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteImage = async () => {
    if (!imageToDelete) return;
    setLoading(true);
    try {
      await api.delete(`/vendor/products/products/${uuid}/${slug}/images/${imageToDelete.id}/delete/`);
      setImages(images.filter((image) => image.id !== imageToDelete.id));
      setError('');
    } catch (error) {
      console.error('Error deleting image:', error);
      setError('Failed to delete image.');
    } finally {
      setLoading(false);
      setImageToDelete(null);  // Close delete modal
    }
  };

  return (
    <div>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {images.map((image) => (
          <Col key={image.id} xs={6} sm={4} md={3} className="mb-4">
            <Card>
              <Card.Img variant="top" src={image.image_url} />
              {isEditMode && (
                <Card.Body>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setImageToDelete(image)}
                  >
                    Delete Image
                  </Button>
                </Card.Body>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {isEditMode && (
        <div>
          <Form.Group>
            <Form.Label>Upload New Images</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
          </Form.Group>
        </div>
      )}

      {/* Delete Image Confirmation Modal */}
      <Modal show={!!imageToDelete} onHide={() => setImageToDelete(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this image?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setImageToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteImage}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductImageManager;


// import React, { useState, useEffect } from 'react';
// import { Button, Form } from 'react-bootstrap';
// import api from '../api';
//
// interface ProductImage {
//   id: number;
//   image_url: string;
// }
//
// interface Props {
//   uuid: string;
//   slug: string;
// }
//
// const ProductImageManager: React.FC<Props> = ({ uuid, slug }) => {
//   const [images, setImages] = useState<ProductImage[]>([]);
//   const [newImage, setNewImage] = useState<File | null>(null);
//
//   const fetchImages = async () => {
//     try {
//       const res = await api.get(`/products/products/${uuid}/${slug}/`);
//       setImages(res.data.images || []);
//     } catch (err) {
//       console.error('Error loading images:', err);
//     }
//   };
//
//   useEffect(() => {
//     fetchImages();
//   }, [uuid, slug]);
//
//   const handleUpload = async () => {
//     if (!newImage) return;
//     const formData = new FormData();
//     formData.append('image', newImage);
//
//     try {
//       await api.post(`/vendor/products/products/${uuid}/${slug}/upload-image/`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       setNewImage(null);
//       fetchImages(); // Refresh images
//     } catch (err) {
//       console.error('Image upload error:', err);
//     }
//   };
//
//   const handleDelete = async (imageId: number) => {
//     try {
//       await api.delete(`/vendor/products/products/{uuid}/${slug}/images/${imageId}/delete/`);
//       setImages(images.filter((img) => img.id !== imageId));
//     } catch (err) {
//       console.error('Delete image error:', err);
//     }
//   };
//
//   return (
//     <div className="mt-3">
//       <Form.Group controlId="imageUpload">
//         <Form.Label>Upload Product Image</Form.Label>
//         <Form.Control type="file" onChange={(e) => setNewImage(e.target.files?.[0] || null)} />
//       </Form.Group>
//       <Button className="mt-2" onClick={handleUpload} disabled={!newImage}>
//         Upload
//       </Button>
//
//       <div className="d-flex flex-wrap mt-3">
//         {images.map((img) => (
//           <div key={img.id} className="me-3 mb-2 text-center">
//             <img
//               src={img.image_url}
//               alt="product"
//               style={{ width: '100px', height: '100px', objectFit: 'cover' }}
//               className="rounded"
//             />
//             <div>
//               <Button size="sm" variant="outline-danger" onClick={() => handleDelete(img.id)}>
//                 Delete
//               </Button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };
//
// export default ProductImageManager;
