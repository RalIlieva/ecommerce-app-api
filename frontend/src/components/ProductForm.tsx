// src/components/ProductForm.tsx
import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

interface ProductFormProps {
  initialValues?: any;
  onSubmit: (data: any) => Promise<void>;
  categories: any[];
  tags: any[];
  submitLabel?: string;
  formResetRef?: React.MutableRefObject<() => void>;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialValues = {},
  onSubmit,
  categories,
  tags,
  submitLabel = 'Submit',
  formResetRef,
}) => {
  const [name, setName] = useState(initialValues.name || '');
  const [description, setDescription] = useState(initialValues.description || '');
  const [price, setPrice] = useState(initialValues.price || 0);
  const [stock, setStock] = useState(initialValues.stock || 0);
  const [category, setCategory] = useState<any>(initialValues.category || null);
  const [selectedTags, setSelectedTags] = useState<any[]>(initialValues.tags || []);

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setName(initialValues.name || '');
      setDescription(initialValues.description || '');
      setPrice(initialValues.price || 0);
      setStock(initialValues.stock || 0);
      setCategory(initialValues.category || null);
      setSelectedTags(initialValues.tags || []);
    }
  }, [initialValues?.uuid]);

  // Attach a reset function to the ref
  useEffect(() => {
    if (formResetRef) {
      formResetRef.current = () => {
        setName('');
        setDescription('');
        setPrice(0);
        setStock(0);
        setCategory(null);
        setSelectedTags([]);
      };
    }
  }, [formResetRef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      description,
      price,
      stock,
      category: {
        name: category?.name,
        slug: category?.slug,
      },
      tags: selectedTags.map((tag: any) => ({
        name: tag.name,
        slug: tag.slug,
      })),
    };

    await onSubmit(payload);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="mb-3">
        <Col>
          <Form.Group controlId="productName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Form.Group controlId="productDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col sm={6}>
          <Form.Group controlId="productPrice">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
            />
          </Form.Group>
        </Col>

        <Col sm={6}>
          <Form.Group controlId="productStock">
            <Form.Label>Stock</Form.Label>
            <Form.Control
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col sm={6}>
          <Form.Group controlId="productCategory">
            <Form.Label>Category</Form.Label>
            <Form.Control
              as="select"
              value={category?.slug || ''}
              onChange={(e) => {
                const selected = categories.find((c) => c.slug === e.target.value);
                setCategory(selected || null);
              }}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.uuid} value={cat.slug}>
                  {cat.name} ({cat.slug})
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>

        <Col sm={6}>
          <Form.Group controlId="productTags">
            <Form.Label>Tags</Form.Label>
            <Form.Control
              as="select"
              multiple
              value={selectedTags.map((tag) => tag.slug)}
              onChange={(e) => {
                const selectedValues = Array.from(e.target.selectedOptions, (o) => o.value);
                const selectedTagObjects = tags.filter((tag) =>
                  selectedValues.includes(tag.slug)
                );
                setSelectedTags(selectedTagObjects);
              }}
            >
              {tags.map((tag) => (
                <option key={tag.uuid} value={tag.slug}>
                  {tag.name} ({tag.slug})
                </option>
              ))}
            </Form.Control>
            <Form.Text className="text-muted">
              Hold Ctrl (Cmd on Mac) to select multiple.
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      <Button type="submit" variant="primary">
        {submitLabel}
      </Button>
    </Form>
  );
};

export default ProductForm;


// // src/components/ProductForm.tsx
// import React, { useEffect, useState } from 'react';
// import { Form, Button, Row, Col } from 'react-bootstrap';
//
// interface ProductFormProps {
//   initialValues?: any;
//   onSubmit: (data: any) => Promise<void>;
//   categories: any[];
//   tags: any[];
//   submitLabel?: string;
// }
//
// const ProductForm: React.FC<ProductFormProps> = ({
//   initialValues = {},
//   onSubmit,
//   categories,
//   tags,
//   submitLabel = 'Submit'
// }) => {
//   const [name, setName] = useState(initialValues.name || '');
//   const [description, setDescription] = useState(initialValues.description || '');
//   const [price, setPrice] = useState(initialValues.price || 0);
//   const [stock, setStock] = useState(initialValues.stock || 0);
//   const [category, setCategory] = useState<any>(initialValues.category || null);
//   const [selectedTags, setSelectedTags] = useState<any[]>(initialValues.tags || []);
//
//   useEffect(() => {
//     if (initialValues && Object.keys(initialValues).length > 0) {
//       setName(initialValues.name || '');
//       setDescription(initialValues.description || '');
//       setPrice(initialValues.price || 0);
//       setStock(initialValues.stock || 0);
//       setCategory(initialValues.category || null);
//       setSelectedTags(initialValues.tags || []);
//     }
//   }, [initialValues?.uuid]);
//
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//
//     const payload = {
//       name,
//       description,
//       price,
//       stock,
//       category: {
//         name: category?.name,
//         slug: category?.slug,
//       },
//       tags: selectedTags.map((tag: any) => ({
//         name: tag.name,
//         slug: tag.slug,
//       })),
//     };
//
//     await onSubmit(payload);
//   };
//
//   return (
//     <Form onSubmit={handleSubmit}>
//       <Row className="mb-3">
//         <Col>
//           <Form.Group controlId="productName">
//             <Form.Label>Name</Form.Label>
//             <Form.Control
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//             />
//           </Form.Group>
//         </Col>
//       </Row>
//
//       <Row className="mb-3">
//         <Col>
//           <Form.Group controlId="productDescription">
//             <Form.Label>Description</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={3}
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               required
//             />
//           </Form.Group>
//         </Col>
//       </Row>
//
//       <Row className="mb-3">
//         <Col sm={6}>
//           <Form.Group controlId="productPrice">
//             <Form.Label>Price</Form.Label>
//             <Form.Control
//               type="number"
//               value={price}
//               onChange={(e) => setPrice(Number(e.target.value))}
//               required
//             />
//           </Form.Group>
//         </Col>
//
//         <Col sm={6}>
//           <Form.Group controlId="productStock">
//             <Form.Label>Stock</Form.Label>
//             <Form.Control
//               type="number"
//               value={stock}
//               onChange={(e) => setStock(Number(e.target.value))}
//               required
//             />
//           </Form.Group>
//         </Col>
//       </Row>
//
//       <Row className="mb-3">
//         <Col sm={6}>
//           <Form.Group controlId="productCategory">
//             <Form.Label>Category</Form.Label>
//             <Form.Control
//               as="select"
//               value={category?.slug || ''}
//               onChange={(e) => {
//                 const selected = categories.find((c) => c.slug === e.target.value);
//                 setCategory(selected || null);
//               }}
//               required
//             >
//               <option value="">Select Category</option>
//               {categories.map((cat) => (
//                 <option key={cat.uuid} value={cat.slug}>
//                   {cat.name} ({cat.slug})
//                 </option>
//               ))}
//             </Form.Control>
//           </Form.Group>
//         </Col>
//
//         <Col sm={6}>
//           <Form.Group controlId="productTags">
//             <Form.Label>Tags</Form.Label>
//             <Form.Control
//               as="select"
//               multiple
//               value={selectedTags.map((tag) => tag.slug)}
//               onChange={(e) => {
//                 const selectedValues = Array.from(e.target.selectedOptions, (o) => o.value);
//                 const selectedTagObjects = tags.filter((tag) =>
//                   selectedValues.includes(tag.slug)
//                 );
//                 setSelectedTags(selectedTagObjects);
//               }}
//             >
//               {tags.map((tag) => (
//                 <option key={tag.uuid} value={tag.slug}>
//                   {tag.name} ({tag.slug})
//                 </option>
//               ))}
//             </Form.Control>
//             <Form.Text className="text-muted">
//               Hold Ctrl (Cmd on Mac) to select multiple.
//             </Form.Text>
//           </Form.Group>
//         </Col>
//       </Row>
//
//       <Button type="submit" variant="primary">
//         {submitLabel}
//       </Button>
//     </Form>
//   );
// };
//
// export default ProductForm;
