// src/pages/vendor/VendorProductDetail.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Modal, Alert } from 'react-bootstrap';
import ProductForm from '../../components/ProductForm';
import ProductImageManager from '../../components/ProductImageManager';
import api from '../../api';

const VendorProductDetail: React.FC = () => {
  const { uuid, slug } = useParams<{ uuid: string; slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const formResetRef = useRef<() => void>(() => {});

  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/products/${uuid}/${slug}/`);
        setProduct(res.data);
      } catch (err) {
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    if (uuid && slug) fetchProduct();
  }, [uuid, slug]);

  // Fetch categories and tags
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/vendor/categories/categories/');
        setAllCategories(res.data.results || res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    const fetchTags = async () => {
      try {
        const res = await api.get('/vendor/tags/tags/');
        setAllTags(res.data.results || res.data);
      } catch (err) {
        console.error('Error fetching tags:', err);
      }
    };

    fetchCategories();
    fetchTags();
  }, []);

  // Handle update
  const handleUpdateProduct = async (updatedData: any) => {
    if (!uuid) return;

    try {
      await api.put(`/vendor/products/products/${uuid}/manage/`, updatedData);
      const refreshed = await api.get(`/products/products/${uuid}/${slug}/`);
      setProduct(refreshed.data);
      setSuccessMessage('Product updated successfully.');
      setShowEditModal(false);
      formResetRef.current?.();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update product:', error);
      setError('Failed to update product.');
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;
  if (!product) return <div className="text-center mt-5">Product not found.</div>;

  return (
    <Container className="mt-5">
      <h2 className="mb-4">Product Detail - {product.name}</h2>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Row>
        <Col md={6}>
          <ProductImageManager uuid={product.uuid} slug={product.slug} />
        </Col>

        <Col md={6}>
          <p><strong>Description:</strong> {product.description}</p>
          <p><strong>Price:</strong> ${product.price}</p>
          <p><strong>Stock:</strong> {product.stock}</p>
          <p><strong>Category:</strong> {product.category?.name}</p>
          <p><strong>Tags:</strong> {product.tags?.map((t: any) => t.name).join(', ')}</p>

          <Button variant="warning" onClick={() => setShowEditModal(true)} className="mt-3">
            Edit Product
          </Button>

          <Link to="/vendor/products">
            <Button variant="secondary" className="mt-3 ms-2">
              &larr; Back to Products
            </Button>
          </Link>
        </Col>
      </Row>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProductForm
            initialValues={product}
            onSubmit={handleUpdateProduct}
            categories={allCategories}
            tags={allTags}
            submitLabel="Update Product"
            formResetRef={formResetRef}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default VendorProductDetail;


// // src/pages/VendorProductDetail.tsx
// import React, { useEffect, useState, useRef } from 'react';
// import { useParams } from 'react-router-dom';
// import { Button, Modal } from 'react-bootstrap';
// import ProductForm from '../../components/ProductForm';
// import api from '../../api';
//
// const VendorProductDetail = () => {
//   const { uuid, slug } = useParams<{ uuid: string; slug: string }>();
//   const [product, setProduct] = useState<any>(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const formResetRef = useRef<() => void>(() => {});
//
//   const [allCategories, setAllCategories] = useState<any[]>([]);
//   const [allTags, setAllTags] = useState<any[]>([]);
//
//   // Fetch product details using the correct endpoint
//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const res = await api.get(`/products/products/${uuid}/${slug}/`);
//         setProduct(res.data);
//       } catch (error) {
//         console.error('Error fetching product:', error);
//       }
//     };
//
//     if (uuid && slug) fetchProduct();
//   }, [uuid, slug]);
//
//   // Fetch categories
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await api.get('/vendor/categories/categories/');
//         setAllCategories(res.data.results || res.data);
//       } catch (error) {
//         console.error('Error fetching categories:', error);
//       }
//     };
//
//     fetchCategories();
//   }, []);
//
//   // Fetch tags
//   useEffect(() => {
//     const fetchTags = async () => {
//       try {
//         const res = await api.get('/vendor/tags/tags/');
//         setAllTags(res.data.results || res.data);
//       } catch (error) {
//         console.error('Error fetching tags:', error);
//       }
//     };
//
//     fetchTags();
//   }, []);
//
//   const handleUpdateProduct = async (updatedData: any) => {
//     if (!uuid) return;
//
//     try {
//       await api.put(`/vendor/products/products/${uuid}/manage/`, updatedData);
//       setShowEditModal(false);
//       formResetRef.current?.();
//
//       const res = await api.get(`/products/products/${uuid}/${slug}/`);
//       setProduct(res.data);
//     } catch (error) {
//       console.error('Failed to update product:', error);
//     }
//   };
//
//   if (!product) return <div>Loading product...</div>;
//
//   return (
//     <div className="container mt-4">
//       <h2>{product.name}</h2>
//       <p>{product.description}</p>
//       <p><strong>Price:</strong> ${product.price}</p>
//       <p><strong>Stock:</strong> {product.stock}</p>
//       <p><strong>Category:</strong> {product.category?.name}</p>
//       <p><strong>Tags:</strong> {product.tags?.map((tag: any) => tag.name).join(', ')}</p>
//
//       <Button variant="warning" onClick={() => setShowEditModal(true)}>
//         Edit Product
//       </Button>
//
//       <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>Edit Product</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <ProductForm
//             initialValues={product}
//             onSubmit={handleUpdateProduct}
//             categories={allCategories}
//             tags={allTags}
//             submitLabel="Update Product"
//             formResetRef={formResetRef}
//           />
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };
//
// export default VendorProductDetail;




// import React, { useEffect, useState } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
// import api from '../../api';
// import ProductImageManager from '../../components/ProductImageManager';
//
// const VendorProductDetail: React.FC = () => {
//   const { uuid, slug } = useParams<{ uuid: string; slug: string }>();
//   const [product, setProduct] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const navigate = useNavigate();
//
//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const response = await api.get(`/products/products/${uuid}/${slug}/`);
//         setProduct(response.data);
//       } catch (err) {
//         setError('Failed to load product details.');
//       } finally {
//         setLoading(false);
//       }
//     };
//
//     if (uuid && slug) {
//       fetchProduct();
//     }
//   }, [uuid, slug]);
//
//   const handleEdit = () => {
//     if (uuid && slug) {
//       navigate(`/vendor/products/${uuid}/${slug}/edit`);
//     }
//   };
//
//   if (loading) {
//     return <div className="text-center mt-5">Loading...</div>;
//   }
//
//   if (error) {
//     return <Alert variant="danger" className="mt-3">{error}</Alert>;
//   }
//
//   if (!product) {
//     return <div className="text-center mt-5">Product not found.</div>;
//   }
//
//   return (
//     <Container className="mt-5">
//       <h2 className="mb-4">Product Detail - {product.name}</h2>
//       <Row>
//         <Col md={6}>
//           <ProductImageManager uuid={product.uuid} slug={product.slug} />
//         </Col>
//         <Col md={6}>
//           <p><strong>Description:</strong> {product.description}</p>
//           <p><strong>Price:</strong> ${product.price}</p>
//           <p><strong>Stock:</strong> {product.stock}</p>
//           <p><strong>Category:</strong> {product.category?.name}</p>
//           <p><strong>Tags:</strong> {product.tags?.map((t: any) => t.name).join(', ')}</p>
//         </Col>
//       </Row>
//
//       <div className="d-flex gap-2 mt-4">
//         <Button variant="primary" onClick={handleEdit}>Edit Product</Button>
//         <Link to="/vendor/products">
//           <Button variant="secondary">&larr; Back to Products</Button>
//         </Link>
//       </div>
//     </Container>
//   );
// };
//
// export default VendorProductDetail;



// // Initial working version
// // src/pages/vendor/VendorProductDetail.tsx
// import React, { useEffect, useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
// import api from '../../api';
// import ProductImageManager from '../../components/ProductImageManager';
//
// const VendorProductDetail: React.FC = () => {
//   const { uuid, slug } = useParams<{ uuid: string; slug: string }>();
//   const [product, setProduct] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//
//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const response = await api.get(`/products/products/${uuid}/${slug}/`);
//         setProduct(response.data);
//       } catch (err) {
//         setError('Failed to load product details.');
//       } finally {
//         setLoading(false);
//       }
//     };
//
//     if (uuid && slug) {
//       fetchProduct();
//     }
//   }, [uuid, slug]);
//
//   if (loading) {
//     return <div className="text-center mt-5">Loading...</div>;
//   }
//
//   if (error) {
//     return <Alert variant="danger" className="mt-3">{error}</Alert>;
//   }
//
//   if (!product) {
//     return <div className="text-center mt-5">Product not found.</div>;
//   }
//
//   return (
//     <Container className="mt-5">
//       <h2 className="mb-4">Product Detail - {product.name}</h2>
//       <Row>
//         <Col md={6}>
//           <ProductImageManager uuid={product.uuid} slug={product.slug} />
//         </Col>
//         <Col md={6}>
//           <p><strong>Description:</strong> {product.description}</p>
//           <p><strong>Price:</strong> ${product.price}</p>
//           <p><strong>Stock:</strong> {product.stock}</p>
//           <p><strong>Category:</strong> {product.category?.name}</p>
//           <p><strong>Tags:</strong> {product.tags?.map((t: any) => t.name).join(', ')}</p>
//         </Col>
//       </Row>
//
//       <Link to="/vendor/products">
//         <Button variant="secondary" className="mt-4">&larr; Back to Products</Button>
//       </Link>
//     </Container>
//   );
// };
//
// export default VendorProductDetail;
