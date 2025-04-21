// src/pages/vendor/VendorProductManagement.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Container, Row, Col, Alert, Modal, Form } from 'react-bootstrap';
import api from '../../api';
import { Link } from 'react-router-dom';
import ProductForm from '../../components/ProductForm';
import ProductImageManager from '../../components/ProductImageManager';
import Pagination from '../../components/Pagination';

const VendorProductManagement: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showEditModal, setShowEditModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTag, setFilterTag] = useState('');

  const formResetRef = useRef<() => void>(() => {});

  const fetchProducts = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: '6',
        ...(search ? { name: search } : {}),
        ...(filterCategory ? { category: filterCategory } : {}),
        ...(filterTag ? { tags: filterTag } : {})
      });
      const response = await api.get(`/vendor/products/products/?${params.toString()}`);
      setProducts(response.data.results);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.total_pages);
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
    fetchCategories();
    fetchTags();
  }, []);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, search, filterCategory, filterTag]);

  const handleAddProduct = async (newProduct: any) => {
    setError('');
    setSuccessMessage('');

    try {
      await api.post('/vendor/products/products/create/', newProduct);
      fetchProducts(currentPage);
      setSuccessMessage('Product added successfully.');

      if (formResetRef.current) {
        formResetRef.current();
      }

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
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
      await api.put(`/vendor/products/products/${productToEdit.uuid}/manage/`, updatedProduct);
      fetchProducts(currentPage);
      setSuccessMessage('Product updated successfully.');
      setShowEditModal(false);
      setProductToEdit(null);

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
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
      fetchProducts(currentPage);
      setSuccessMessage('Product deleted successfully.');

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
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
        formResetRef={formResetRef}
      />

      <h5 className="mt-5 mb-3">My Products</h5>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={4} className="mb-2">
          <Form.Control
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => {
              setCurrentPage(1);
              setSearch(e.target.value);
            }}
          />
        </Col>
        <Col md={4} className="mb-2">
          <Form.Select
            value={filterCategory}
            onChange={(e) => {
              setCurrentPage(1);
              setFilterCategory(e.target.value);
            }}
          >
            <option value="">-- Filter by Category --</option>
            {allCategories.map((cat) => (
              <option key={cat.uuid} value={cat.slug}>{cat.name}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={4} className="mb-2">
          <Form.Select
            value={filterTag}
            onChange={(e) => {
              setCurrentPage(1);
              setFilterTag(e.target.value);
            }}
          >
            <option value="">-- Filter by Tag --</option>
            {allTags.map((tag) => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

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
                  <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => handleEditProduct(product)}>
                    Edit
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleConfirmDelete(product)}>
                    Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          fetchProducts(page);
        }}
      />

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
// import React, { useState, useEffect, useRef } from 'react';
// import { Button, Card, Container, Row, Col, Alert, Modal } from 'react-bootstrap';
// import api from '../../api';
// import { Link } from 'react-router-dom';
// import ProductForm from '../../components/ProductForm';
// import ProductImageManager from '../../components/ProductImageManager';
// import Pagination from '../../components/Pagination';
//
// const VendorProductManagement: React.FC = () => {
//   const [products, setProducts] = useState<any[]>([]);
//   const [allCategories, setAllCategories] = useState<any[]>([]);
//   const [allTags, setAllTags] = useState<any[]>([]);
//   const [error, setError] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [productToEdit, setProductToEdit] = useState<any | null>(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [productToDelete, setProductToDelete] = useState<any | null>(null);
//
//   const formResetRef = useRef<() => void>(() => {});
//
//   const fetchProducts = async (page = 1) => {
//     try {
//       const response = await api.get(`/vendor/products/products/?page=${page}&page_size=6`);
//       setProducts(response.data.results);
//       setCurrentPage(response.data.current_page);
//       setTotalPages(response.data.total_pages);
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
//     fetchProducts(currentPage);
//     fetchCategories();
//     fetchTags();
//   }, [currentPage]);
//
//   const handleAddProduct = async (newProduct: any) => {
//     setError('');
//     setSuccessMessage('');
//
//     try {
//       await api.post('/vendor/products/products/create/', newProduct);
//       fetchProducts(currentPage);
//       setSuccessMessage('Product added successfully.');
//
//       // Reset form fields
//       if (formResetRef.current) {
//         formResetRef.current();
//       }
//
//       // Automatically clear the success message after a few seconds
//       setTimeout(() => {
//         setSuccessMessage('');
//       }, 3000);
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
//       const response = await api.get(`/products/products/${product.uuid}/${product.slug}/`);
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
//       fetchProducts(currentPage);
//       setSuccessMessage('Product updated successfully.');
//       setShowEditModal(false);
//       setProductToEdit(null);
//
//       setTimeout(() => {
//         setSuccessMessage('');
//       }, 3000);
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
//       fetchProducts(currentPage);
//       setSuccessMessage('Product deleted successfully.');
//
//       setTimeout(() => {
//         setSuccessMessage('');
//       }, 3000);
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
//       <Link to="/vendor/dashboard">
//         <Button variant="secondary" className="mb-3">&larr; Back to Dashboard</Button>
//       </Link>
//
//       <h5 className="mb-3">Add New Product</h5>
//       <ProductForm
//         onSubmit={handleAddProduct}
//         categories={allCategories}
//         tags={allTags}
//         submitLabel="Add Product"
//         formResetRef={formResetRef}
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
//                   <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => handleEditProduct(product)}>
//                     Edit
//                   </Button>
//                   <Button variant="outline-danger" size="sm" onClick={() => handleConfirmDelete(product)}>
//                     Delete
//                   </Button>
//                 </div>
//               </Card.Body>
//             </Card>
//           </Col>
//         ))}
//       </Row>
//
//       {/* Pagination */}
//       <Pagination
//         currentPage={currentPage}
//         totalPages={totalPages}
//         onPageChange={(page) => {
//           setCurrentPage(page);
//           fetchProducts(page);
//         }}
//       />
//
//       {/* Edit Modal */}
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
//       {/* Delete Modal */}
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

// // Initial version
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
