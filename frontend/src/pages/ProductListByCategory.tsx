// // src/pages/ProductListByCategory.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProducts, Product } from '../api/products';
import { fetchCategoryDetail, Category } from '../api/categories';
import ProductGrid from '../components/ProductGrid';
import Pagination from '../components/Pagination';

const ProductListByCategory: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const getProductsByCategory = async () => {
      if (!slug) return;

      try {
        setLoading(true);

        // Fetch category details
        const categoryData = await fetchCategoryDetail(slug);
        setCategory(categoryData);

        // Fetch paginated products for the category
        const productsData = await fetchProducts({
          category: slug,
          page: currentPage,
          page_size: 6,
        });

        setProducts(productsData.results || []);
        setTotalPages(productsData.total_pages || 1);
      } catch (err) {
        setError('Failed to fetch products for this category.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getProductsByCategory();
  }, [slug, currentPage]);

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
        <>
          <ProductGrid products={products} />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
{/*           {totalPages > 1 && ( */}
{/*             <div className="d-flex justify-content-center mt-4"> */}
{/*               <ul className="pagination"> */}
{/*                 <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}> */}
{/*                   <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}> */}
{/*                     &laquo; */}
{/*                   </button> */}
{/*                 </li> */}
{/*                 {Array.from({ length: totalPages }, (_, i) => ( */}
{/*                   <li */}
{/*                     key={i + 1} */}
{/*                     className={`page-item ${currentPage === i + 1 ? 'active' : ''}`} */}
{/*                   > */}
{/*                     <button className="page-link" onClick={() => setCurrentPage(i + 1)}> */}
{/*                       {i + 1} */}
{/*                     </button> */}
{/*                   </li> */}
{/*                 ))} */}
{/*                 <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}> */}
{/*                   <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}> */}
{/*                     &raquo; */}
{/*                   </button> */}
{/*                 </li> */}
{/*               </ul> */}
{/*             </div> */}
{/*           )} */}
{/*         </> */}
{/*       )} */}

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
// import ProductGrid from '../components/ProductGrid';
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
//
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
//
//       {products.length === 0 ? (
//         <p>No products found in this category.</p>
//       ) : (
//         <ProductGrid products={products} />
//       )}
//
//       <Link to="/categories" className="btn btn-secondary mt-3">
//         Back to Categories
//       </Link>
//     </div>
//   );
// };
//
// export default ProductListByCategory;
