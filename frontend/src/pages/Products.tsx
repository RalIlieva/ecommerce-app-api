// src/pages/Products.tsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Added useLocation
import api from '../api';
import { fetchProducts, Product } from '../api/products';
import { fetchCategories, Category } from '../api/categories';
import { fetchTags, Tag } from '../api/tags';

const Products: React.FC = () => {
  const location = useLocation(); // **Change**: Initialized location

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // States for filters
  // const [searchName, setSearchName] = useState<string>(''); // **Change**: Removed searchName state
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // slug
  const [selectedTag, setSelectedTag] = useState<string>(''); // tag slug
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Parse query parameters using URLSearchParams
        const params = new URLSearchParams(location.search);
        const initialSearch = params.get('search') || '';

        // Removed the setSearchName call since searchName is no longer used
        // setSearchName(initialSearch);

        // Construct API request parameters
        const apiParams: Record<string, any> = {}; // **Change**: Renamed from 'params' to 'apiParams'

        if (initialSearch.trim() !== '') apiParams.search = initialSearch.trim(); // **Change**
        if (selectedCategory.trim() !== '') apiParams.category = selectedCategory.trim();
        if (selectedTag.trim() !== '') apiParams.tags = selectedTag.trim();
        if (minPrice.trim() !== '') apiParams.min_price = Number(minPrice);
        if (maxPrice.trim() !== '') apiParams.max_price = Number(maxPrice);
        if (minRating.trim() !== '') apiParams.min_avg_rating = Number(minRating);

        // Log the parameters for debugging
        console.log('Fetching products with params:', apiParams); // **Change**

        const [productsData, categoriesData, tagsData] = await Promise.all([
          fetchProducts(apiParams), // **Change**: Using 'apiParams' instead of 'params'
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
  }, [location.search, selectedCategory, selectedTag, minPrice, maxPrice, minRating]); // **Change**: Removed 'searchName' from dependencies

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
      {/* Removed Search by Name Input */}
      <div className="row mb-3">
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
              <option key={tag.id} value={tag.id}>
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


// // src/pages/Products.tsx
// import React, { useEffect, useState } from 'react';
// import { Link, useLocation } from 'react-router-dom'; // Added useLocation
// import api from '../api';
// import { fetchProducts, Product } from '../api/products';
// import { fetchCategories, Category } from '../api/categories';
// import { fetchTags, Tag } from '../api/tags';
//
// const Products: React.FC = () => {
//   const location = useLocation(); // Initialized location
//
//   const [products, setProducts] = useState<Product[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [tags, setTags] = useState<Tag[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//
//   // States for filters
//   const [searchName, setSearchName] = useState<string>('');
//   const [selectedCategory, setSelectedCategory] = useState<string>(''); // slug
//   const [selectedTag, setSelectedTag] = useState<string>(''); // tag slug
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
//         // Set the search filter
//         setSearchName(initialSearch);
//
//         // Construct API request parameters
//         const apiParams: Record<string, any> = {}; // Renamed from 'params' to 'apiParams'
//
//         if (initialSearch.trim() !== '') apiParams.search = initialSearch.trim(); // **Change**
//         if (selectedCategory.trim() !== '') apiParams.category = selectedCategory.trim();
//         if (selectedTag.trim() !== '') apiParams.tags = selectedTag.trim();
//         if (minPrice.trim() !== '') apiParams.min_price = Number(minPrice);
//         if (maxPrice.trim() !== '') apiParams.max_price = Number(maxPrice);
//         if (minRating.trim() !== '') apiParams.min_avg_rating = Number(minRating);
//
//         // Log the parameters for debugging
//         console.log('Fetching products with params:', apiParams); // **Change**
//
//         const [productsData, categoriesData, tagsData] = await Promise.all([
//           fetchProducts(apiParams), // **Change**: Using 'apiParams' instead of 'params'
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
//   }, [location.search, selectedCategory, selectedTag, minPrice, maxPrice, minRating]); // **Change**: Removed 'searchName' from dependencies
//
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
//      <div className="row mb-3">
//         <div className="col-md-3 mb-2">
//           <input
//             type="text"
//             className="form-control"
//             placeholder="Search by name..."
//             value={searchName}
//             onChange={(e) => setSearchName(e.target.value)}
//           />
//         </div>
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
//                   <Link to={`/products/products/${product.uuid}/${product.slug}`} className="text-decoration-none text-dark">
//                     {product.name}
//                   </Link>
//                 </h5>
//                 <p className="card-text text-muted">Brand: {product.brand}</p>
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
//                 {product.average_rating !== undefined && (
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


// // src/pages/Products/Products.tsx
// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import api from '../api';
// import { fetchProducts, Product } from '../api/products';
// import { fetchCategories, Category } from '../api/categories';
// import { fetchTags, Tag } from '../api/tags';
//
// const Products: React.FC = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [tags, setTags] = useState<Tag[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//
//   // States for filters
//   const [searchName, setSearchName] = useState<string>('');
//   const [selectedCategory, setSelectedCategory] = useState<string>(''); // slug
//   const [selectedTag, setSelectedTag] = useState<string>(''); // tag slug
//   const [minPrice, setMinPrice] = useState<string>('');
//   const [maxPrice, setMaxPrice] = useState<string>('');
//   const [minRating, setMinRating] = useState<string>('');
//
//   useEffect(() => {
//     const fetchAllData = async () => {
//       try {
//         setLoading(true);
//
//         // Construct parameters object
//         const params: Record<string, any> = {};
//
//         if (searchName.trim() !== '') params.name = searchName.trim();
//         if (selectedCategory.trim() !== '') params.category = selectedCategory.trim();
//         if (selectedTag.trim() !== '') params.tags = selectedTag.trim();
//         if (minPrice.trim() !== '') params.min_price = Number(minPrice);
//         if (maxPrice.trim() !== '') params.max_price = Number(maxPrice);
//         if (minRating.trim() !== '') params.min_avg_rating = Number(minRating);
//
//         // Log the parameters for debugging
//         console.log('Fetching products with params:', params);
//
//         const [productsData, categoriesData, tagsData] = await Promise.all([
//           fetchProducts(params),
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
//   }, [searchName, selectedCategory, selectedTag, minPrice, maxPrice, minRating]);
//
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
//             placeholder="Search by name..."
//             value={searchName}
//             onChange={(e) => setSearchName(e.target.value)}
//           />
//         </div>
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
//         <div className="col-md-3 mb-2">
//           <select
//             className="form-select"
//             value={selectedTag}
//             onChange={(e) => setSelectedTag(e.target.value)}
//           >
//             <option value="">-- Filter by Tag --</option>
//             {tags.map((tag) => (
//                 <option key={tag.id} value={tag.id}>
//                 {tag.name}
//               </option>
//             ))}
//           </select>
//         </div>
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
//                   <Link to={`/products/products/${product.uuid}/${product.slug}`} className="text-decoration-none text-dark">
//                     {product.name}
//                   </Link>
//                 </h5>
//                 <p className="card-text text-muted">Brand: {product.brand}</p>
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
//                 {product.average_rating !== undefined && (
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
