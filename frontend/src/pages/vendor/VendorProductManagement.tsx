// src/pages/vendor/VendorProductManagement.tsx

import React, { useState, useEffect } from 'react';
import { Button, Card, Container, Row, Col, Alert, Modal } from 'react-bootstrap';
import api from '../../api';
import { Link } from 'react-router-dom';
import ProductForm from '../../components/ProductForm';
import ProductImageManager from '../../components/ProductImageManager';

const VendorProductManagement: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/vendor/products/products/');
      setProducts(response.data.results);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products.');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/vendor/categories/categories/');
      setAllCategories(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await api.get('/vendor/tags/tags/');
      setAllTags(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchTags();
  }, []);

  const handleAddProduct = async (newProduct: any) => {
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.post('/vendor/products/products/create/', newProduct);
      setProducts([...products, response.data]);
      setSuccessMessage('Product added successfully.');
    } catch (error: any) {
      console.error('Error adding product:', error);
      if (error.response?.data) {
        setError(JSON.stringify(error.response.data, null, 2));
      } else {
        setError('Failed to add product.');
      }
    }
  };

  const handleEditProduct = async (product: any) => {
    try {
      const response = await api.get(`/products/products/${product.uuid}/${product.slug}/`);
      setProductToEdit(response.data);
      setShowEditModal(true);
    } catch (error) {
      console.error("Failed to fetch full product detail:", error);
      setError("Could not load product details for editing.");
    }
  };

  const handleUpdateProduct = async (updatedProduct: any) => {
    if (!productToEdit) return;
    setError('');
    setSuccessMessage('');
    try {
      const response = await api.put(`/vendor/products/products/${productToEdit.uuid}/manage/`, updatedProduct);
      const updatedList = products.map((p) => (p.uuid === productToEdit.uuid ? response.data : p));
      setProducts(updatedList);
      setSuccessMessage('Product updated successfully.');
      setShowEditModal(false);
      setProductToEdit(null);
    } catch (error: any) {
      console.error('Error updating product:', error);
      if (error.response?.data) {
        setError(JSON.stringify(error.response.data, null, 2));
      } else {
        setError('Failed to update product.');
      }
    }
  };

  const handleConfirmDelete = (product: any) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/vendor/products/products/${productToDelete.uuid}/manage/`);
      const updatedList = products.filter((p) => p.uuid !== productToDelete.uuid);
      setProducts(updatedList);
      setSuccessMessage('Product deleted successfully.');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product.');
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  return (
    <Container className="mt-5">
      <h4 className="mb-4">Vendor Product Management</h4>

      {error && <Alert variant="danger"><pre>{error}</pre></Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Link to="/vendor/dashboard">
          <Button variant="secondary" className="mb-3">&larr; Back to Dashboard</Button>
       </Link>

      <h5 className="mb-3">Add New Product</h5>
      <ProductForm
        onSubmit={handleAddProduct}
        categories={allCategories}
        tags={allTags}
        submitLabel="Add Product"
      />

      <h5 className="mt-5 mb-3">Your Products</h5>
      <Row>
        {products.map((product) => (
          <Col xs={12} sm={6} lg={4} key={product.id} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>Price: ${product.price}</Card.Text>
                <Card.Text>Stock: {product.stock}</Card.Text>
                <Card.Text>Category: {product.category?.name || product.category}</Card.Text>
                <Card.Text>{product.description}</Card.Text>

                {product.uuid && product.slug && (
                  <ProductImageManager uuid={product.uuid} slug={product.slug} />
                )}

                <div className="mt-3">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEditProduct(product)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleConfirmDelete(product)}
                  >
                    Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Edit Product Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {productToEdit && (
            <ProductForm
              initialValues={productToEdit}
              onSubmit={handleUpdateProduct}
              categories={allCategories}
              tags={allTags}
              submitLabel="Update Product"
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{productToDelete?.name}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteProduct}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default VendorProductManagement;




// // src/pages/vendor/VendorProductManagement.tsx
// // Loading spinners& UX polishers
//
// import React, { useState, useEffect } from 'react';
// import { Button, Card, Container, Row, Col, Alert, Modal } from 'react-bootstrap';
// import api from '../../api';
// import ProductForm from '../../components/ProductForm';
// import ProductImageManager from '../../components/ProductImageManager';
//
// const VendorProductManagement: React.FC = () => {
//   const [products, setProducts] = useState<any[]>([]);
//   const [allCategories, setAllCategories] = useState<any[]>([]);
//   const [allTags, setAllTags] = useState<any[]>([]);
//   const [error, setError] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');
//
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [productToEdit, setProductToEdit] = useState<any | null>(null);
//
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [productToDelete, setProductToDelete] = useState<any | null>(null);
//
//   const fetchProducts = async () => {
//     try {
//       const response = await api.get('/vendor/products/products/');
//       setProducts(response.data.results);
//     } catch (error) {
//       console.error('Error fetching products:', error);
//       setError('Failed to fetch products.');
//     }
//   };
//
//   const fetchCategories = async () => {
//     try {
//       const response = await api.get('/vendor/categories/categories/');
//       setAllCategories(response.data.results || response.data);
//     } catch (error) {
//       console.error('Error fetching categories:', error);
//     }
//   };
//
//   const fetchTags = async () => {
//     try {
//       const response = await api.get('/vendor/tags/tags/');
//       setAllTags(response.data.results || response.data);
//     } catch (error) {
//       console.error('Error fetching tags:', error);
//     }
//   };
//
//   useEffect(() => {
//     fetchProducts();
//     fetchCategories();
//     fetchTags();
//   }, []);
//
//   const handleAddProduct = async (newProduct: any) => {
//     setError('');
//     setSuccessMessage('');
//
//     try {
//       const response = await api.post('/vendor/products/products/create/', newProduct);
//       setProducts([...products, response.data]);
//       setSuccessMessage('Product added successfully.');
//     } catch (error: any) {
//       console.error('Error adding product:', error);
//       if (error.response?.data) {
//         setError(JSON.stringify(error.response.data, null, 2));
//       } else {
//         setError('Failed to add product.');
//       }
//     }
//   };
//
//   const handleEditProduct = async (product: any) => {
//     try {
//       const response = await api.get(`/vendor/products/products/${product.uuid}/${product.slug}/`);
//       setProductToEdit(response.data);
//       setShowEditModal(true);
//     } catch (error) {
//       console.error("Failed to fetch full product detail:", error);
//       setError("Could not load product details for editing.");
//     }
//   };
//
//   const handleUpdateProduct = async (updatedProduct: any) => {
//     if (!productToEdit) return;
//     setError('');
//     setSuccessMessage('');
//     try {
//       const response = await api.put(`/vendor/products/products/${productToEdit.uuid}/manage/`, updatedProduct);
//       const updatedList = products.map((p) => (p.uuid === productToEdit.uuid ? response.data : p));
//       setProducts(updatedList);
//       setSuccessMessage('Product updated successfully.');
//       setShowEditModal(false);
//       setProductToEdit(null);
//     } catch (error: any) {
//       console.error('Error updating product:', error);
//       if (error.response?.data) {
//         setError(JSON.stringify(error.response.data, null, 2));
//       } else {
//         setError('Failed to update product.');
//       }
//     }
//   };
//
//   const handleConfirmDelete = (product: any) => {
//     setProductToDelete(product);
//     setShowDeleteModal(true);
//   };
//
//   const handleDeleteProduct = async () => {
//     if (!productToDelete) return;
//     try {
//       await api.delete(`/vendor/products/products/${productToDelete.uuid}/manage/`);
//       const updatedList = products.filter((p) => p.uuid !== productToDelete.uuid);
//       setProducts(updatedList);
//       setSuccessMessage('Product deleted successfully.');
//     } catch (error: any) {
//       console.error('Error deleting product:', error);
//       setError('Failed to delete product.');
//     } finally {
//       setShowDeleteModal(false);
//       setProductToDelete(null);
//     }
//   };
//
//   return (
//     <Container className="mt-5">
//       <h4 className="mb-4">Vendor Product Management</h4>
//
//       {error && <Alert variant="danger"><pre>{error}</pre></Alert>}
//       {successMessage && <Alert variant="success">{successMessage}</Alert>}
//
//       <h5 className="mb-3">Add New Product</h5>
//       <ProductForm
//         onSubmit={handleAddProduct}
//         categories={allCategories}
//         tags={allTags}
//         submitLabel="Add Product"
//       />
//
//       <h5 className="mt-5 mb-3">Your Products</h5>
//       <Row>
//         {products.map((product) => (
//           <Col xs={12} sm={6} lg={4} key={product.id} className="mb-4">
//             <Card>
//               <Card.Body>
//                 <Card.Title>{product.name}</Card.Title>
//                 <Card.Text>Price: ${product.price}</Card.Text>
//                 <Card.Text>Stock: {product.stock}</Card.Text>
//                 <Card.Text>Category: {product.category?.name || product.category}</Card.Text>
//                 <Card.Text>{product.description}</Card.Text>
//
//                 {product.uuid && product.slug && (
//                   <ProductImageManager uuid={product.uuid} slug={product.slug} />
//                 )}
//
//                 <div className="mt-3">
//                   <Button
//                     variant="outline-secondary"
//                     size="sm"
//                     className="me-2"
//                     onClick={() => handleEditProduct(product)}
//                   >
//                     Edit
//                   </Button>
//                   <Button
//                     variant="outline-danger"
//                     size="sm"
//                     onClick={() => handleConfirmDelete(product)}
//                   >
//                     Delete
//                   </Button>
//                 </div>
//               </Card.Body>
//             </Card>
//           </Col>
//         ))}
//       </Row>
//
//       {/* Edit Product Modal */}
//       <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>Edit Product</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {productToEdit && (
//             <ProductForm
//               initialValues={productToEdit}
//               onSubmit={handleUpdateProduct}
//               categories={allCategories}
//               tags={allTags}
//               submitLabel="Update Product"
//             />
//           )}
//         </Modal.Body>
//       </Modal>
//
//       {/* Delete Confirmation Modal */}
//       <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm Delete</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           Are you sure you want to delete <strong>{productToDelete?.name}</strong>?
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="danger" onClick={handleDeleteProduct}>
//             Delete
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   );
// };
//
// export default VendorProductManagement;
