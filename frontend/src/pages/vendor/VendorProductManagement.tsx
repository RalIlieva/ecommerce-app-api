// // src/pages/vendor/VendorProductManagement.tsx
// src/pages/vendor/VendorProductManagement.tsx

import React, { useState, useEffect } from 'react';
import { Button, Card, Container, Row, Col, Form, Alert } from 'react-bootstrap';
import api from '../../api';
import ProductImageManager from '../../components/ProductImageManager';

const VendorProductManagement: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load vendor's products
  const fetchProducts = async () => {
    try {
      const response = await api.get('/vendor/products/products/');
      setProducts(response.data.results);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products.');
    }
  };

  // Load available categories
  const fetchCategories = async () => {
    try {
      const response = await api.get('/vendor/categories/categories/');
      setAllCategories(response.data.results || response.data); // depends on pagination
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Load available tags
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

  // Handle new product creation
  const handleAddProduct = async () => {
    const newProduct = { name, price, stock, category, tags };
    try {
      const response = await api.post('/vendor/products/products/', newProduct);
      setProducts([...products, response.data]);
      setSuccessMessage('Product added successfully.');
      setName('');
      setPrice(0);
      setStock(0);
      setCategory('');
      setTags([]);
    } catch (error) {
      console.error('Error adding product:', error);
      setError('Failed to add product.');
    }
  };

  return (
    <Container className="mt-5">
      <h4 className="mb-4">Vendor Product Management</h4>

      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Add Product Form */}
      <Row className="mb-3">
        <Col xs={12} sm={4}>
          <Form.Group controlId="productName">
            <Form.Label>Product Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
        </Col>

        <Col xs={12} sm={4}>
          <Form.Group controlId="productPrice">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
            />
          </Form.Group>
        </Col>

        <Col xs={12} sm={4}>
          <Form.Group controlId="productStock">
            <Form.Label>Stock</Form.Label>
            <Form.Control
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col xs={12} sm={6}>
          <Form.Group controlId="productCategory">
            <Form.Label>Category</Form.Label>
            <Form.Control
              as="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {allCategories.map((cat) => (
                <option key={cat.uuid} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>

        <Col xs={12} sm={6}>
          <Form.Group controlId="productTags">
            <Form.Label>Tags</Form.Label>
            <Form.Control
              as="select"
              multiple
              value={tags}
              onChange={(e) =>
                setTags(Array.from(e.target.selectedOptions, (option) => option.value))
              }
            >
              {allTags.map((tag) => (
                <option key={tag.uuid} value={tag.slug}>
                  {tag.name}
                </option>
              ))}
            </Form.Control>
            <Form.Text className="text-muted">
              Hold Ctrl (Cmd on Mac) to select multiple tags.
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      <Button onClick={handleAddProduct} variant="primary">
        Add Product
      </Button>

      {/* Existing Products List */}
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

                {/* Image management component */}
                {product.uuid && product.slug && (
                  <ProductImageManager uuid={product.uuid} slug={product.slug} />
                )}

                <div className="mt-3">
                  <Button variant="outline-secondary" size="sm" className="me-2">
                    Edit
                  </Button>
                  <Button variant="outline-danger" size="sm">
                    Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default VendorProductManagement;



//
// import React, { useState, useEffect } from 'react';
// import { Button, Card, Container, Row, Col, Form } from 'react-bootstrap'; // Using Bootstrap components
// import api from '../../api';
//
// const VendorProductManagement: React.FC = () => {
//   const [products, setProducts] = useState<any[]>([]);
//   const [name, setName] = useState('');
//   const [price, setPrice] = useState<number>(0);
//   const [stock, setStock] = useState<number>(0);
//
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await api.get('/vendor/products/products/');
//         setProducts(response.data.results);
//       } catch (error) {
//         console.error('Error fetching products:', error);
//       }
//     };
//     fetchProducts();
//   }, []);
//
//   const handleAddProduct = async () => {
//     const newProduct = { name, price, stock };
//     try {
//       const response = await api.post('/vendor/products/', newProduct);
//       setProducts([...products, response.data]);
//       setName('');
//       setPrice(0);
//       setStock(0);
//     } catch (error) {
//       console.error('Error adding product:', error);
//     }
//   };
//
//   return (
//     <Container className="mt-5">
//       <h4 className="mb-4">Product Management</h4>
//
//       <Row className="mb-3">
//         <Col xs={12} sm={4}>
//           <Form.Group controlId="productName">
//             <Form.Label>Product Name</Form.Label>
//             <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} />
//           </Form.Group>
//         </Col>
//         <Col xs={12} sm={4}>
//           <Form.Group controlId="productPrice">
//             <Form.Label>Price</Form.Label>
//             <Form.Control type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
//           </Form.Group>
//         </Col>
//         <Col xs={12} sm={4}>
//           <Form.Group controlId="productStock">
//             <Form.Label>Stock</Form.Label>
//             <Form.Control type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
//           </Form.Group>
//         </Col>
//       </Row>
//
//       <Button onClick={handleAddProduct} variant="primary">Add Product</Button>
//
//       <h6 className="mt-4">Existing Products</h6>
//       <Row>
//         {products.map((product) => (
//           <Col xs={12} sm={4} key={product.id} className="mb-3">
//             <Card>
//               <Card.Body>
//                 <Card.Title>{product.name}</Card.Title>
//                 <Card.Text>Price: ${product.price}</Card.Text>
//                 <Card.Text>Stock: {product.stock}</Card.Text>
//                 <Button variant="outline-secondary" className="me-2">Edit</Button>
//                 <Button variant="outline-danger">Delete</Button>
//               </Card.Body>
//             </Card>
//           </Col>
//         ))}
//       </Row>
//     </Container>
//   );
// };
//
// export default VendorProductManagement;
