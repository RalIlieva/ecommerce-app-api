// src/pages/Products/Products.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { fetchProducts, Product } from '../api/products';
import { fetchCategories, Category } from '../api/categories';
import { fetchTags, Tag } from '../api/tags';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // States for filters
  const [searchName, setSearchName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // slug
  const [selectedTag, setSelectedTag] = useState<string>(''); // tag UUID
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Construct parameters object
        const params: Record<string, any> = {};

        if (searchName.trim() !== '') params.name = searchName.trim();
        if (selectedCategory.trim() !== '') params.category = selectedCategory.trim();
        if (selectedTag.trim() !== '') params.tags = selectedTag.trim();
        if (minPrice.trim() !== '') params.min_price = Number(minPrice);
        if (maxPrice.trim() !== '') params.max_price = Number(maxPrice);
        if (minRating.trim() !== '') params.min_avg_rating = Number(minRating);

        // Log the parameters for debugging
        console.log('Fetching products with params:', params);

        const [productsData, categoriesData, tagsData] = await Promise.all([
          fetchProducts(params),
          fetchCategories(),
          fetchTags(),
        ]);

        setProducts(productsData.results || productsData);
        setCategories(categoriesData.results || categoriesData);
        setTags(tagsData.results || tagsData);
      } catch (err: any) {
        setError('Failed to fetch data.');
        if (err.response) {
          console.error('Error response:', err.response.data);
          setError(`Error: ${JSON.stringify(err.response.data)}`);
        } else if (err.request) {
          console.error('No response received:', err.request);
          setError('No response from server.');
        } else {
          console.error('Error:', err.message);
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [searchName, selectedCategory, selectedTag, minPrice, maxPrice, minRating]);

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

      {/* Filters Row */}
      <div className="row mb-3">
        <div className="col-md-3 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
        <div className="col-md-3 mb-2">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">-- Filter by Category --</option>
            {categories.map((cat) => (
              <option key={cat.uuid} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3 mb-2">
          <select
            className="form-select"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <option value="">-- Filter by Tag --</option>
            {tags.map((tag) => (
              <option key={tag.uuid} value={tag.uuid}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3 mb-2">
          <input
            type="number"
            className="form-control"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
        <div className="col-md-3 mb-2">
          <input
            type="number"
            className="form-control"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
        <div className="col-md-3 mb-2">
          <input
            type="number"
            className="form-control"
            placeholder="Min Rating"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            min="1"
            max="5"
          />
        </div>
      </div>

      {/* Products Grid */}
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
                <p className="card-text text-muted">Brand: {product.brand}</p>
                <p className="card-text">Category: {product.category?.name}</p>
                <p className="card-text">
                  Tags:{' '}
                  {product.tags.map((tag) => (
                    <span key={tag.uuid} className="badge bg-secondary me-1">
                      {tag.name}
                    </span>
                  ))}
                </p>
                <h6 className="card-text text-primary">${product.price}</h6>
                {product.average_rating !== undefined && (
                  <p className="text-warning">Avg Rating: {product.average_rating}</p>
                )}
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
// import { Link } from 'react-router-dom';
// import api from '../api';
//
// interface Product {
//   uuid: string;
//   name: string;
//   slug: string;
//   image: string;
//   brand: string;
//   price: string;
//   average_rating?: number; // If your backend returns this
// }
//
// const Products: React.FC = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//
//   // New states for search and filter
//   const [searchName, setSearchName] = useState<string>('');
//   const [selectedTag, setSelectedTag] = useState<string>(''); // or an empty string as default
//   const [minRating, setMinRating] = useState<string>('');
//   // You could also do minPrice, maxPrice, etc.
//
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//
//         // Build query params:
//         const params: any = {};
//         if (searchName) params.name = searchName;   // from your backend filter: ?name=<val>
//         if (selectedTag) params.tags = selectedTag; // if you pass tags as an ID or slug
//         if (minRating) params.min_avg_rating = minRating;
//
//         const response = await api.get('/products/products/', { params });
//         console.log('Fetched products:', response.data);
//
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
//   }, [searchName, selectedTag, minRating]);
//   // Re-fetch whenever these filters change
//
//   // Render loading / error states
//   if (loading)
//     return (
//       <div className="container text-center mt-5">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </div>
//     );
//
//   if (error)
//     return (
//       <div className="container text-center mt-5">
//         <p className="text-danger">{error}</p>
//       </div>
//     );
//
//   return (
//     <div className="container mt-5">
//       <h1 className="text-center mb-4">Products</h1>
//
//       {/* Filters Row */}
//       <div className="row mb-3">
//         <div className="col-md-3 mb-2">
//           <input
//             type="text"
//             className="form-control"
//             placeholder="Search name..."
//             value={searchName}
//             onChange={(e) => setSearchName(e.target.value)}
//           />
//         </div>
//         <div className="col-md-3 mb-2">
//           <input
//             type="number"
//             className="form-control"
//             placeholder="Min Avg Rating"
//             value={minRating}
//             onChange={(e) => setMinRating(e.target.value)}
//           />
//         </div>
//         <div className="col-md-3 mb-2">
//           <select
//             className="form-select"
//             value={selectedTag}
//             onChange={(e) => setSelectedTag(e.target.value)}
//           >
//             <option value="">-- Filter by Tag --</option>
//             {/* Later we’ll fill actual tags from the API (see TagList below) */}
//             <option value="tag-uuid-1">Tag 1</option>
//             <option value="tag-uuid-2">Tag 2</option>
//             {/* etc. */}
//           </select>
//         </div>
//       </div>
//
//       {/* Products Grid */}
//       <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
//         {products.map((product) => (
//           <div className="col" key={product.uuid}>
//             <div className="card h-100">
//               <div
//                 className="card-img-top overflow-hidden"
//                 style={{ height: '200px' }}
//               >
//                 <Link to={`/products/products/${product.uuid}/${product.slug}`}>
//                   <img
//                     src={product.image || 'https://via.placeholder.com/300'}
//                     className="img-fluid"
//                     alt={product.name}
//                     style={{ objectFit: 'cover', width: '100%', height: '100%' }}
//                   />
//                 </Link>
//               </div>
//               <div className="card-body">
//                 <h5 className="card-title">
//                   <Link
//                     to={`/products/products/${product.uuid}/${product.slug}`}
//                     className="text-decoration-none text-dark"
//                   >
//                     {product.name}
//                   </Link>
//                 </h5>
//                 <p className="card-text text-muted">Brand: {product.brand}</p>
//                 <h6 className="card-text text-primary">${product.price}</h6>
//                 {product.average_rating && (
//                   <p className="text-warning">Avg Rating: {product.average_rating}</p>
//                 )}
//               </div>
//               <div className="card-footer bg-transparent">
//                 <div className="d-flex justify-content-between">
//                   <button className="btn btn-primary">Add to Cart</button>
//                   <button className="btn btn-outline-danger">
//                     <i className="fas fa-heart"></i>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };
//
// export default Products;
//
//
// // import React, { useEffect, useState } from 'react';
// // import { Link } from 'react-router-dom'; // Import Link for navigation
// // import api from '../api';
// //
// // interface Product {
// //   uuid: string;
// //   name: string;
// //   slug: string;
// //   image: string;
// //   brand: string;
// //   price: string;
// // }
// //
// // const Products: React.FC = () => {
// //   const [products, setProducts] = useState<Product[]>([]);
// //   const [loading, setLoading] = useState<boolean>(true);
// //   const [error, setError] = useState<string | null>(null);
// //
// //   useEffect(() => {
// //     const fetchProducts = async () => {
// //       try {
// //         const response = await api.get('/products/products/');
// //         console.log('Fetched products:', response.data);
// //
// //         // Ensure we are setting the products from the 'results' field
// //         if (Array.isArray(response.data.results)) {
// //           setProducts(response.data.results);
// //         } else {
// //           setError('The response data is not in the expected format.');
// //         }
// //       } catch (err) {
// //         setError('Failed to fetch products.');
// //         console.error('Error fetching products:', err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //
// //     fetchProducts();
// //   }, []);
// //
// //   if (loading)
// //     return (
// //       <div className="container text-center mt-5">
// //         <div className="spinner-border text-primary" role="status">
// //           <span className="visually-hidden">Loading...</span>
// //         </div>
// //       </div>
// //     );
// //
// //   if (error)
// //     return (
// //       <div className="container text-center mt-5">
// //         <p className="text-danger">{error}</p>
// //       </div>
// //     );
// //
// //   return (
// //     <div className="container mt-5">
// //       <h1 className="text-center mb-4">Products</h1>
// //       <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
// //         {products.map((product) => (
// //           <div className="col" key={product.uuid}>
// //             <div className="card h-100">
// //               <div className="card-img-top overflow-hidden" style={{ height: '200px' }}>
// //                 <Link to={`/products/products/${product.uuid}/${product.slug}`}>
// //                   <img
// //                     src={product.image || 'https://via.placeholder.com/300'}
// //                     className="img-fluid"
// //                     alt={product.name}
// //                     style={{ objectFit: 'cover', width: '100%', height: '100%' }}
// //                   />
// //                 </Link>
// //               </div>
// //               <div className="card-body">
// //                 <h5 className="card-title">
// //                   <Link to={`/products/products/${product.uuid}/${product.slug}`} className="text-decoration-none text-dark">
// //                     {product.name}
// //                   </Link>
// //                 </h5>
// //                 <p className="card-text text-muted">{product.brand}</p>
// //                 <h6 className="card-text text-primary">${product.price}</h6>
// //               </div>
// //               <div className="card-footer bg-transparent">
// //                 <div className="d-flex justify-content-between">
// //                   <button className="btn btn-primary">Add to Cart</button>
// //                   <button className="btn btn-outline-danger">
// //                     <i className="fas fa-heart"></i>
// //                   </button>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // };
// //
// // export default Products;
