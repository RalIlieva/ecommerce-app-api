import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import { fetchProducts, Product } from '../api/products';
import { fetchCategories, Category } from '../api/categories';
import { fetchTags, Tag } from '../api/tags';
import ProductGrid from '../components/ProductGrid';
import Pagination from '../components/Pagination';

const Products: React.FC = () => {
  const location = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams(location.search);
        const initialSearch = params.get('search') || '';

        const apiParams: Record<string, any> = {
          page: currentPage,
          page_size: 6,
        };

        if (initialSearch.trim()) apiParams.name = initialSearch.trim();
        if (selectedCategory.trim()) apiParams.category = selectedCategory.trim();
        if (selectedTag.trim()) apiParams.tags = selectedTag.trim();
        if (minPrice.trim()) apiParams.min_price = Number(minPrice);
        if (maxPrice.trim()) apiParams.max_price = Number(maxPrice);
        if (minRating.trim()) apiParams.min_avg_rating = Number(minRating);

        const [productsData, categoriesData, tagsData] = await Promise.all([
          fetchProducts(apiParams),
          fetchCategories(),
          fetchTags(),
        ]);

        setProducts(productsData.results || productsData);
        setTotalPages(productsData.total_pages || 1);
        setCurrentPage(productsData.current_page || 1);
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
  }, [
    location.search,
    selectedCategory,
    selectedTag,
    minPrice,
    maxPrice,
    minRating,
    currentPage,
  ]);

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
        <div className="col-md-3 mb-2">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => {
              setCurrentPage(1);
              setSelectedCategory(e.target.value);
            }}
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
            onChange={(e) => {
              setCurrentPage(1);
              setSelectedTag(e.target.value);
            }}
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
            onChange={(e) => {
              setCurrentPage(1);
              setMinPrice(e.target.value);
            }}
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
            onChange={(e) => {
              setCurrentPage(1);
              setMaxPrice(e.target.value);
            }}
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
            onChange={(e) => {
              setCurrentPage(1);
              setMinRating(e.target.value);
            }}
            min="1"
            max="5"
          />
        </div>
      </div>

      {/* Product List */}
      <ProductGrid products={products} />

      {/* Pagination */}
            <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Products;


// // src/pages/Products.tsx
// import React, { useEffect, useState } from 'react';
// import { useLocation } from 'react-router-dom';
// import api from '../api';
// import { fetchProducts, Product } from '../api/products';
// import { fetchCategories, Category } from '../api/categories';
// import { fetchTags, Tag } from '../api/tags';
// import ProductGrid from '../components/ProductGrid';
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
//   // Filter states
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
//         // Parse query params for 'search'
//         const params = new URLSearchParams(location.search);
//         const initialSearch = params.get('search') || '';
//
//         // Build the API request params
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
//         // Some APIs return { results: [...] }, others return an array
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
//         {/* Category Filter */}
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
//         {/* Tag Filter */}
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
//         {/* Min Price */}
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
//         {/* Max Price */}
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
//         {/* Min Rating */}
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
//       <ProductGrid products={products} />
//     </div>
//   );
// };
//
// export default Products;
