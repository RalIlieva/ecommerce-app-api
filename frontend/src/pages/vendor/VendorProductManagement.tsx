// // src/pages/vendor/VendorProductManagement.tsx

import React, { useState, useEffect } from 'react';
import { Button, Card, Container, Row, Col, Form, Alert } from 'react-bootstrap';
import api from '../../api';
import ImageGallery from '../../components/ImageGallery'; // Component for handling product images

const VendorProductManagement: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]); // For multiple tags
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/vendor/products/products/');
        setProducts(response.data.results);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to fetch products.');
      }
    };
    fetchProducts();
  }, []);

  // Handle adding a new product
  const handleAddProduct = async () => {
    const newProduct = { name, price, stock, category, tags };
    try {
      const response = await api.post('/vendor/products/', newProduct);
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
      <h4 className="mb-4">Product Management</h4>

      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

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

      <Row className="mb-3">
        <Col xs={12} sm={4}>
          <Form.Group controlId="productCategory">
            <Form.Label>Category</Form.Label>
            <Form.Control as="select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {/* You should fetch categories from API and populate the select options */}
              <option value="">Select Category</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              {/* Add more categories */}
            </Form.Control>
          </Form.Group>
        </Col>

        <Col xs={12} sm={4}>
          <Form.Group controlId="productTags">
            <Form.Label>Tags</Form.Label>
            <Form.Control
              type="text"
              value={tags.join(', ')}
              onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()))}
              placeholder="Enter tags separated by commas"
            />
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
                <ImageGallery productId={product.id} /> {/* Component to manage images */}
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
