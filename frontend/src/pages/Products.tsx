import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import api from '../api';

interface Product {
  uuid: string;
  name: string;
  slug: string;
  image: string;
  brand: string;
  price: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products/products/');
        console.log('Fetched products:', response.data);

        // Ensure we are setting the products from the 'results' field
        if (Array.isArray(response.data.results)) {
          setProducts(response.data.results);
        } else {
          setError('The response data is not in the expected format.');
        }
      } catch (err) {
        setError('Failed to fetch products.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading)
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="container text-center mt-5">
        <p className="text-danger">{error}</p>
      </div>
    );

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Products</h1>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
        {products.map((product) => (
          <div className="col" key={product.uuid}>
            <div className="card h-100">
              <div className="card-img-top overflow-hidden" style={{ height: '200px' }}>
                <Link to={`/products/products/${product.uuid}/${product.slug}`}>
                  <img
                    src={product.image || 'https://via.placeholder.com/300'}
                    className="img-fluid"
                    alt={product.name}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                </Link>
              </div>
              <div className="card-body">
                <h5 className="card-title">
                  <Link to={`/products/products/${product.uuid}/${product.slug}`} className="text-decoration-none text-dark">
                    {product.name}
                  </Link>
                </h5>
                <p className="card-text text-muted">{product.brand}</p>
                <h6 className="card-text text-primary">${product.price}</h6>
              </div>
              <div className="card-footer bg-transparent">
                <div className="d-flex justify-content-between">
                  <button className="btn btn-primary">Add to Cart</button>
                  <button className="btn btn-outline-danger">
                    <i className="fas fa-heart"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;


// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';  // Import Link for navigation
// import api from '../api';
//
// interface Product {
//   uuid: string;
//   name: string;
//   slug: string;
//   // Add other product fields as needed
// }
//
// const Products: React.FC = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await api.get('/products/products/'); // Correct endpoint
//         console.log('Fetched products:', response.data); // Log the response
//
//         // Ensure we are setting the products from the 'results' field
//         if (Array.isArray(response.data.results)) {
//           setProducts(response.data.results);
//         } else {
//           setError('The response data is not in the expected format.');
//         }
//       } catch (err) {
//         setError('Failed to fetch products.');
//         console.error('Error fetching products:', err);
//       } finally {
//         setLoading(false);
//       }
//     };
//
//     fetchProducts();
//   }, []);
//
//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>{error}</p>;
//
//   return (
//     <div>
//       <h1>Products</h1>
//       <ul>
//         {products.map((product) => (
//           <li key={product.uuid}>
//             <a href={`/products/products/${product.uuid}/${product.slug}/`}>
//               {product.name}
//             </a>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };
//
// export default Products;
