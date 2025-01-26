// src/pages/ProductListByCategory.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProducts, Product } from '../api/products';
import { fetchCategoryDetail, Category } from '../api/categories';
import ProductGrid from '../components/ProductGrid';

const ProductListByCategory: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getProductsByCategory = async () => {
      if (!slug) return;

      try {
        setLoading(true);

        // Fetch category details
        const categoryData = await fetchCategoryDetail(slug);
        setCategory(categoryData);

        // Fetch products filtered by category slug
        const productsData = await fetchProducts({ category: slug });
        setProducts(productsData.results || productsData);
      } catch (err) {
        setError('Failed to fetch products for this category.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getProductsByCategory();
  }, [slug]);

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

  if (!category)
    return (
      <div className="container text-center mt-5">
        <p>Category not found.</p>
      </div>
    );

  return (
    <div className="container mt-5">
      <h2>Products in "{category.name}"</h2>

      {products.length === 0 ? (
        <p>No products found in this category.</p>
      ) : (
        <ProductGrid products={products} />
      )}

      <Link to="/categories" className="btn btn-secondary mt-3">
        Back to Categories
      </Link>
    </div>
  );
};

export default ProductListByCategory;



// // src/pages/ProductListByCategory.tsx
// import React, { useEffect, useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { fetchProducts, Product } from '../api/products';
// import { fetchCategoryDetail, Category } from '../api/categories';
// import { renderStars } from '../utils';
//
// const ProductListByCategory: React.FC = () => {
//   const { slug } = useParams<{ slug: string }>();
//   const [products, setProducts] = useState<Product[]>([]);
//   const [category, setCategory] = useState<Category | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//
//   useEffect(() => {
//     const getProductsByCategory = async () => {
//       if (!slug) return;
//
//       try {
//         setLoading(true);
//         // Fetch category details
//         const categoryData = await fetchCategoryDetail(slug);
//         setCategory(categoryData);
//
//         // Fetch products filtered by category slug
//         const productsData = await fetchProducts({ category: slug });
//         setProducts(productsData.results || productsData);
//       } catch (err) {
//         setError('Failed to fetch products for this category.');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//
//     getProductsByCategory();
//   }, [slug]);
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
//   if (!category)
//     return (
//       <div className="container text-center mt-5">
//         <p>Category not found.</p>
//       </div>
//     );
//
//   return (
//     <div className="container mt-5">
//       <h2>Products in "{category.name}"</h2>
//       {products.length === 0 ? (
//         <p>No products found in this category.</p>
//       ) : (
//         <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
//           {products.map((product) => (
//             <div className="col" key={product.uuid}>
//               <div className="card h-100">
//                 <div className="card-img-top overflow-hidden" style={{ height: '200px' }}>
//                   <Link to={`/products/products/${product.uuid}/${product.slug}`}>
//                     <img
//                       src={product.image || 'https://via.placeholder.com/300'}
//                       className="img-fluid"
//                       alt={product.name}
//                       style={{ objectFit: 'cover', width: '100%', height: '100%' }}
//                     />
//                   </Link>
//                 </div>
//                 <div className="card-body">
//                   <h5 className="card-title">
//                     <Link to={`/products/products/${product.uuid}/${product.slug}`} className="text-decoration-none text-dark">
//                       {product.name}
//                     </Link>
//                   </h5>
//                   <p className="card-text text-muted">Brand: {product.brand}</p>
//                   <p className="card-text">Category: {product.category?.name}</p>
//                   <p className="card-text">
//                     Tags:{' '}
//                     {product.tags.map((tag) => (
//                       <span key={tag.uuid} className="badge bg-secondary me-1">
//                         {tag.name}
//                       </span>
//                     ))}
//                   </p>
//                   <h6 className="card-text text-primary">${product.price}</h6>
//                   {/* Average rating */}
//                   {product.average_rating !== null && product.average_rating !== undefined && (
//                     <div className="mb-2">
//                         {renderStars(product.average_rating)}
//                         <span className="ms-2">
//                             {product.average_rating.toFixed(1)}/5
//                         </span>
//                     </div>
//                     )}
//                 </div>
//                 <div className="card-footer bg-transparent">
//                   <div className="d-flex justify-content-between">
//                     <button className="btn btn-primary">Add to Cart</button>
//                     <button className="btn btn-outline-danger">
//                       <i className="fas fa-heart"></i>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//       <Link to="/categories" className="btn btn-secondary mt-3">
//         Back to Categories
//       </Link>
//     </div>
//   );
// };
//
// export default ProductListByCategory;