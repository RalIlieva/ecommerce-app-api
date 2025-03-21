// New version - to be tested
// // src/pages/vendor/VendorProductManagement.tsx
// import React, { useState, useEffect } from 'react';
// import { Button, TextField, Grid, Card, Typography } from 'react-bootstrap'; // Import Bootstrap components correctly
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
//         const response = await api.get('/vendor/products/');
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
//     <div className="container mt-5">
//       <Typography variant="h4" gutterBottom>
//         Product Management
//       </Typography>
//
//       <Grid container spacing={2}>
//         <Grid item xs={12} sm={4}>
//           <TextField
//             label="Product Name"
//             fullWidth
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//           />
//         </Grid>
//         <Grid item xs={12} sm={4}>
//           <TextField
//             label="Price"
//             fullWidth
//             type="number"
//             value={price}
//             onChange={(e) => setPrice(Number(e.target.value))}
//           />
//         </Grid>
//         <Grid item xs={12} sm={4}>
//           <TextField
//             label="Stock"
//             fullWidth
//             type="number"
//             value={stock}
//             onChange={(e) => setStock(Number(e.target.value))}
//           />
//         </Grid>
//
//         <Grid item xs={12}>
//           <Button onClick={handleAddProduct} variant="contained">Add Product</Button>
//         </Grid>
//       </Grid>
//
//       <Typography variant="h6" sx={{ mt: 4 }}>Existing Products</Typography>
//       <Grid container spacing={2}>
//         {products.map((product) => (
//           <Grid item xs={12} sm={4} key={product.id}>
//             <Card className="h-100">
//               <Card.Body>
//                 <Typography variant="body1">{product.name}</Typography>
//                 <Typography variant="body2">Price: ${product.price}</Typography>
//                 <Typography variant="body2">Stock: {product.stock}</Typography>
//                 <Button variant="outline" sx={{ mt: 2 }}>Edit</Button>
//                 <Button variant="outline" sx={{ mt: 2 }}>Delete</Button>
//               </Card.Body>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     </div>
//   );
// };
//
// export default VendorProductManagement;


// Initial version
// // src/pages/vendor/VendorProductManagement.tsx
// import React, { useState, useEffect } from 'react';
// import { Button, TextField, Grid, Box, Typography } from 'react-bootstrap'; // Import Bootstrap components
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
//         const response = await api.get('/vendor/products/');
//         setProducts(response.data);
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
//       const response = await api.post('/vendor/products/products/', newProduct);
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
//     <div className="container mt-5">
//       <Typography variant="h4" gutterBottom>
//         Product Management
//       </Typography>
//
//       <Grid container spacing={2}>
//         <Grid item xs={12} sm={4}>
//           <TextField
//             label="Product Name"
//             fullWidth
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//           />
//         </Grid>
//         <Grid item xs={12} sm={4}>
//           <TextField
//             label="Price"
//             fullWidth
//             type="number"
//             value={price}
//             onChange={(e) => setPrice(Number(e.target.value))}
//           />
//         </Grid>
//         <Grid item xs={12} sm={4}>
//           <TextField
//             label="Stock"
//             fullWidth
//             type="number"
//             value={stock}
//             onChange={(e) => setStock(Number(e.target.value))}
//           />
//         </Grid>
//
//         <Grid item xs={12}>
//           <Button onClick={handleAddProduct} variant="contained">Add Product</Button>
//         </Grid>
//       </Grid>
//
//       <Typography variant="h6" sx={{ mt: 4 }}>Existing Products</Typography>
//       <Grid container spacing={2}>
//         {products.map((product) => (
//           <Grid item xs={12} sm={4} key={product.id}>
//             <Box className="card">
//               <Typography variant="body1">{product.name}</Typography>
//               <Typography variant="body2">Price: ${product.price}</Typography>
//               <Typography variant="body2">Stock: {product.stock}</Typography>
//               <Button variant="outline" sx={{ mt: 2 }}>Edit</Button>
//               <Button variant="outline" sx={{ mt: 2 }}>Delete</Button>
//             </Box>
//           </Grid>
//         ))}
//       </Grid>
//     </div>
//   );
// };
//
// export default VendorProductManagement;
