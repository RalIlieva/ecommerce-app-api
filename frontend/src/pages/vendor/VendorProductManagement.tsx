// src/pages/vendor/VendorProductManagement.tsx

import React, { useState, useEffect } from 'react';
import { Button, Card, Container, Row, Col, Form, Alert } from 'react-bootstrap';
import api from '../../api';
import ProductImageManager from '../../components/ProductImageManager';

const VendorProductManagement: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [category, setCategory] = useState<any>(null);
  const [tags, setTags] = useState<any[]>([]);

  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleAddProduct = async () => {
    setError('');
    setSuccessMessage('');

    const newProduct = {
      name,
      description,
      price,
      stock,
      category: category ? { name: category.name, slug: category.slug } : null,
      tags: tags.map((tag: any) => ({ name: tag.name, slug: tag.slug }))
    };

    console.log('Submitting product:', newProduct);

    try {
      const response = await api.post('/vendor/products/products/create/', newProduct);
      setProducts([...products, response.data]);
      setSuccessMessage('Product added successfully.');
      setName('');
      setDescription('');
      setPrice(0);
      setStock(0);
      setCategory(null);
      setTags([]);
    } catch (error: any) {
      console.error('Error adding product:', error);
      if (error.response?.data) {
        setError(JSON.stringify(error.response.data, null, 2));
      } else {
        setError('Failed to add product.');
      }
    }
  };

  return (
    <Container className="mt-5">
      <h4 className="mb-4">Vendor Product Management</h4>

      {error && <Alert variant="danger"><pre>{error}</pre></Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Add Product Form */}
      <Row className="mb-3">
        <Col xs={12}>
          <Form.Group controlId="productName" className="mb-3">
            <Form.Label>Product Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
        </Col>

        <Col xs={12}>
          <Form.Group controlId="productDescription" className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>
        </Col>

        <Col xs={12} sm={4}>
          <Form.Group controlId="productPrice" className="mb-3">
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
          <Form.Group controlId="productStock" className="mb-3">
            <Form.Label>Stock</Form.Label>
            <Form.Control
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              required
            />
          </Form.Group>
        </Col>

        <Col xs={12} sm={4}>
          <Form.Group controlId="productCategory" className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Control
              as="select"
              value={category?.slug || ''}
              onChange={(e) => {
                const selected = allCategories.find((c) => c.slug === e.target.value);
                setCategory(selected || null);
              }}
              required
            >
              <option value="">Select Category</option>
              {allCategories.map((cat) => (
                <option key={cat.uuid} value={cat.slug}>
                  {cat.name} ({cat.slug})
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>

        <Col xs={12}>
          <Form.Group controlId="productTags" className="mb-3">
            <Form.Label>Tags</Form.Label>
            <Form.Control
              as="select"
              multiple
              value={tags.map((tag) => tag.slug)}
              onChange={(e) => {
                const selectedValues = Array.from(e.target.selectedOptions, (o) => o.value);
                const selectedTags = allTags.filter((tag) => selectedValues.includes(tag.slug));
                setTags(selectedTags);
              }}
            >
              {allTags.map((tag) => (
                <option key={tag.uuid} value={tag.slug}>
                  {tag.name} ({tag.slug})
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
                <Card.Text>
                  Category: {product.category?.name || product.category}
                </Card.Text>
                <Card.Text>{product.description}</Card.Text>

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
