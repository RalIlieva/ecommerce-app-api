import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';  // Import Link for navigation
import api from '../api';

interface Product {
  uuid: string;
  name: string;
  slug: string;
  // Add other product fields as needed
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products/'); // Correct endpoint
        console.log('Fetched products:', response.data); // Log the response

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map((product) => (
          <li key={product.uuid}>
            <a href={`/products/products/${product.uuid}/${product.slug}/`}>
              {product.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Products;




// // src/pages/Products.tsx
// import React, { useEffect, useState } from 'react';
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
//         const response = await api.get('/products/products/');
//         setProducts(response.data);
//       } catch (err) {
//         setError('Failed to fetch products.');
//         console.error(err);
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
//             <a href={`/products/${product.uuid}/${product.slug}/`}>
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
