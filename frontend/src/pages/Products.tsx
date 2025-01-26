// src/pages/Products.tsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import { fetchProducts, Product } from '../api/products';
import { fetchCategories, Category } from '../api/categories';
import { fetchTags, Tag } from '../api/tags';
import ProductGrid from '../components/ProductGrid';

const Products: React.FC = () => {
  const location = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Parse query params for 'search'
        const params = new URLSearchParams(location.search);
        const initialSearch = params.get('search') || '';

        // Build the API request params
        const apiParams: Record<string, any> = {};

        if (initialSearch.trim()) apiParams.search = initialSearch.trim();
        if (selectedCategory.trim()) apiParams.category = selectedCategory.trim();
        if (selectedTag.trim()) apiParams.tags = selectedTag.trim();
        if (minPrice.trim()) apiParams.min_price = Number(minPrice);
        if (maxPrice.trim()) apiParams.max_price = Number(maxPrice);
        if (minRating.trim()) apiParams.min_avg_rating = Number(minRating);

        console.log('Fetching products with params:', apiParams);

        const [productsData, categoriesData, tagsData] = await Promise.all([
          fetchProducts(apiParams),
          fetchCategories(),
          fetchTags(),
        ]);

        // Some APIs return { results: [...] }, others return an array
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
  }, [location.search, selectedCategory, selectedTag, minPrice, maxPrice, minRating]);

  if (loading) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center mt-5">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Products</h1>

      {/* Filters Row */}
      <div className="row mb-3">
        {/* Category Filter */}
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

        {/* Tag Filter */}
        <div className="col-md-3 mb-2">
          <select
            className="form-select"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <option value="">-- Filter by Tag --</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price */}
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

        {/* Max Price */}
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

        {/* Min Rating */}
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
      <ProductGrid products={products} />
    </div>
  );
};

export default Products;


// // src/pages/Products.tsx
// import React, { useEffect, useState } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import api from '../api';
// import { fetchProducts, Product } from '../api/products';
// import { fetchCategories, Category } from '../api/categories';
// import { fetchTags, Tag } from '../api/tags';
//
// // Import the helper from our new utils.tsx file:
// import { renderStars } from '../utils';
//
// const Products: React.FC = () => {
//   const location = useLocation();
//
//   const [products, setProducts] = useState<Product[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [tags, setTags] = useState<Tag[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//
//   // States for filters
//   const [selectedCategory, setSelectedCategory] = useState<string>('');
//   const [selectedTag, setSelectedTag] = useState<string>('');
//   const [minPrice, setMinPrice] = useState<string>('');
//   const [maxPrice, setMaxPrice] = useState<string>('');
//   const [minRating, setMinRating] = useState<string>('');
//
//   useEffect(() => {
//     const fetchAllData = async () => {
//       try {
//         setLoading(true);
//
//         // Parse query parameters using URLSearchParams
//         const params = new URLSearchParams(location.search);
//         const initialSearch = params.get('search') || '';
//
//         // Construct API request parameters
//         const apiParams: Record<string, any> = {};
//
//         if (initialSearch.trim()) apiParams.search = initialSearch.trim();
//         if (selectedCategory.trim()) apiParams.category = selectedCategory.trim();
//         if (selectedTag.trim()) apiParams.tags = selectedTag.trim();
//         if (minPrice.trim()) apiParams.min_price = Number(minPrice);
//         if (maxPrice.trim()) apiParams.max_price = Number(maxPrice);
//         if (minRating.trim()) apiParams.min_avg_rating = Number(minRating);
//
//         console.log('Fetching products with params:', apiParams);
//
//         const [productsData, categoriesData, tagsData] = await Promise.all([
//           fetchProducts(apiParams),
//           fetchCategories(),
//           fetchTags(),
//         ]);
//
//         setProducts(productsData.results || productsData);
//         setCategories(categoriesData.results || categoriesData);
//         setTags(tagsData.results || tagsData);
//       } catch (err: any) {
//         setError('Failed to fetch data.');
//         if (err.response) {
//           console.error('Error response:', err.response.data);
//           setError(`Error: ${JSON.stringify(err.response.data)}`);
//         } else if (err.request) {
//           console.error('No response received:', err.request);
//           setError('No response from server.');
//         } else {
//           console.error('Error:', err.message);
//           setError('An unexpected error occurred.');
//         }
//       } finally {
//         setLoading(false);
//       }
//     };
//
//     fetchAllData();
//   }, [location.search, selectedCategory, selectedTag, minPrice, maxPrice, minRating]);
//
//   if (loading) {
//     return (
//       <div className="container text-center mt-5">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </div>
//     );
//   }
//
//   if (error) {
//     return (
//       <div className="container text-center mt-5">
//         <p className="text-danger">{error}</p>
//       </div>
//     );
//   }
//
//   return (
//     <div className="container mt-5">
//       <h1 className="text-center mb-4">Products</h1>
//
//       {/* Filters Row */}
//       <div className="row mb-3">
//         <div className="col-md-3 mb-2">
//           <select
//             className="form-select"
//             value={selectedCategory}
//             onChange={(e) => setSelectedCategory(e.target.value)}
//           >
//             <option value="">-- Filter by Category --</option>
//             {categories.map((cat) => (
//               <option key={cat.uuid} value={cat.slug}>
//                 {cat.name}
//               </option>
//             ))}
//           </select>
//         </div>
//
//         <div className="col-md-3 mb-2">
//           <select
//             className="form-select"
//             value={selectedTag}
//             onChange={(e) => setSelectedTag(e.target.value)}
//           >
//             <option value="">-- Filter by Tag --</option>
//             {tags.map((tag) => (
//               <option key={tag.id} value={tag.id}>
//                 {tag.name}
//               </option>
//             ))}
//           </select>
//         </div>
//
//         <div className="col-md-3 mb-2">
//           <input
//             type="number"
//             className="form-control"
//             placeholder="Min Price"
//             value={minPrice}
//             onChange={(e) => setMinPrice(e.target.value)}
//             min="0"
//             step="0.01"
//           />
//         </div>
//
//         <div className="col-md-3 mb-2">
//           <input
//             type="number"
//             className="form-control"
//             placeholder="Max Price"
//             value={maxPrice}
//             onChange={(e) => setMaxPrice(e.target.value)}
//             min="0"
//             step="0.01"
//           />
//         </div>
//
//         <div className="col-md-3 mb-2">
//           <input
//             type="number"
//             className="form-control"
//             placeholder="Min Rating"
//             value={minRating}
//             onChange={(e) => setMinRating(e.target.value)}
//             min="1"
//             max="5"
//           />
//         </div>
//       </div>
//
//       {/* Products Grid */}
//       <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
//         {products.map((product) => (
//           <div className="col" key={product.uuid}>
//             <div className="card h-100">
//               <div className="card-img-top overflow-hidden" style={{ height: '200px' }}>
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
//                 <p className="card-text">Category: {product.category?.name}</p>
//                 <p className="card-text">
//                   Tags:{' '}
//                   {product.tags.map((tag) => (
//                     <span key={tag.uuid} className="badge bg-secondary me-1">
//                       {tag.name}
//                     </span>
//                   ))}
//                 </p>
//                 <h6 className="card-text text-primary">${product.price}</h6>
//
//                 {/* Display average rating as stars + numeric if not null */}
//                 {product.average_rating !== null &&
//                   product.average_rating !== undefined && (
//                     <div className="my-2">
//                       {renderStars(product.average_rating)}
//                       <span className="ms-2">
//                         {product.average_rating.toFixed(1)}/5
//                       </span>
//                     </div>
//                   )}
//               </div>
//
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
