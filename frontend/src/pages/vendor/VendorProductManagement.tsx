// src/pages/vendor/VendorProductManagement.tsx

import React, { useState, useEffect } from 'react';
import { Button, Card, Container, Row, Col, Form } from 'react-bootstrap'; // Using Bootstrap components
import api from '../../api';

const VendorProductManagement: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/vendor/products/products/');
        setProducts(response.data.results);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleAddProduct = async () => {
    const newProduct = { name, price, stock };
    try {
      const response = await api.post('/vendor/products/', newProduct);
      setProducts([...products, response.data]);
      setName('');
      setPrice(0);
      setStock(0);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <Container className="mt-5">
      <h4 className="mb-4">Product Management</h4>

      <Row className="mb-3">
        <Col xs={12} sm={4}>
          <Form.Group controlId="productName">
            <Form.Label>Product Name</Form.Label>
            <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </Form.Group>
        </Col>
        <Col xs={12} sm={4}>
          <Form.Group controlId="productPrice">
            <Form.Label>Price</Form.Label>
            <Form.Control type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </Form.Group>
        </Col>
        <Col xs={12} sm={4}>
          <Form.Group controlId="productStock">
            <Form.Label>Stock</Form.Label>
            <Form.Control type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
          </Form.Group>
        </Col>
      </Row>

      <Button onClick={handleAddProduct} variant="primary">Add Product</Button>

      <h6 className="mt-4">Existing Products</h6>
      <Row>
        {products.map((product) => (
          <Col xs={12} sm={4} key={product.id} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>Price: ${product.price}</Card.Text>
                <Card.Text>Stock: {product.stock}</Card.Text>
                <Button variant="outline-secondary" className="me-2">Edit</Button>
                <Button variant="outline-danger">Delete</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default VendorProductManagement;
