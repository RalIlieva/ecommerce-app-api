import React, { useState, useEffect } from 'react';
import { Button, Card, Container, Row, Col, Modal, Form, Spinner } from 'react-bootstrap';
import api from '../../api';

const VendorTags: React.FC = () => {
  const [tags, setTags] = useState<any[]>([]);
  const [tagToEdit, setTagToEdit] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTag, setNewTag] = useState({ name: '', slug: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/vendor/tags/tags/');
        setTags(response.data.results);
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTags();
  }, []);

  const handleCreateTag = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/vendor/tags/tags/create/', newTag);
      setTags([...tags, response.data]);
      setNewTag({ name: '', slug: '' });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating tag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTag = (tag: any) => {
    setTagToEdit(tag);
    setShowEditModal(true);
  };

  const handleUpdateTag = async () => {
    setIsLoading(true);
    try {
      // First, check if the slug already exists in the database
      const existingTagResponse = await api.get(`/vendor/tags/tags/`);
      const existingTags = existingTagResponse.data.results;

      const slugExists = existingTags.some((tag: any) => tag.slug === tagToEdit.slug && tag.id !== tagToEdit.id);

      if (slugExists) {
        alert("This slug already exists. Please choose a different one.");
        setIsLoading(false);
        return;
      }

      // Proceed with the update if the slug doesn't exist
      const response = await api.put(`/vendor/tags/tags/${tagToEdit.uuid}/manage/`, tagToEdit);
      const updatedTags = tags.map((t) => (t.uuid === tagToEdit.uuid ? response.data : t));
      setTags(updatedTags);
      setShowEditModal(false);
      setTagToEdit(null);
    } catch (error) {
      console.error('Error updating tag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = (tag: any) => {
    setTagToDelete(tag);
    setShowDeleteModal(true);
  };

  const handleDeleteTag = async () => {
    if (!tagToDelete) return;
    setIsLoading(true);
    try {
      await api.delete(`/vendor/tags/tags/${tagToDelete.uuid}/manage/`);
      setTags(tags.filter((tag) => tag.uuid !== tagToDelete.uuid));
      setShowDeleteModal(false); // Close the modal after deletion
    } catch (error) {
      console.error('Error deleting tag:', error);
    } finally {
      setTagToDelete(null);
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <h4>Tags</h4>
      <Button variant="primary" onClick={() => setShowCreateModal(true)}>Create Tag</Button>

      <Row className="mt-3">
        {tags.map((tag) => (
          <Col key={tag.uuid} sm={4}>
            <Card>
              <Card.Body>
                <Card.Title>{tag.name}</Card.Title>
                <Card.Text>Slug: {tag.slug}</Card.Text>
                <Button variant="secondary" onClick={() => handleEditTag(tag)}>Edit</Button>
                <Button variant="danger" onClick={() => handleConfirmDelete(tag)}>Delete</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Spinner for loading state */}
      {isLoading && <div className="text-center"><Spinner animation="border" variant="primary" /></div>}

      {/* Create Tag Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Tag</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="tagName">
              <Form.Label>Tag Name</Form.Label>
              <Form.Control
                type="text"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="tagSlug">
              <Form.Label>Slug</Form.Label>
              <Form.Control
                type="text"
                value={newTag.slug}
                onChange={(e) => setNewTag({ ...newTag, slug: e.target.value })}
              />
            </Form.Group>
            <Button variant="primary" onClick={handleCreateTag}>Create</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Tag Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Tag</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {tagToEdit && (
            <Form>
              <Form.Group controlId="tagName">
                <Form.Label>Tag Name</Form.Label>
                <Form.Control
                  type="text"
                  value={tagToEdit.name}
                  onChange={(e) => setTagToEdit({ ...tagToEdit, name: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="tagSlug">
                <Form.Label>Slug</Form.Label>
                <Form.Control
                  type="text"
                  value={tagToEdit.slug}
                  onChange={(e) => setTagToEdit({ ...tagToEdit, slug: e.target.value })}
                />
              </Form.Group>
              <Button variant="primary" onClick={handleUpdateTag}>Update</Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{tagToDelete?.name}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteTag}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default VendorTags;


// // src/pages/vendor/VendorTags.tsx
// import React, { useState, useEffect } from 'react';
// import { Button, Card, Container, Row, Col, Modal, Form } from 'react-bootstrap';
// import api from '../../api';
//
// const VendorTags: React.FC = () => {
//   const [tags, setTags] = useState<any[]>([]);
//   const [tagToEdit, setTagToEdit] = useState<any | null>(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [newTag, setNewTag] = useState({ name: '', slug: '' });
//
//   useEffect(() => {
//     const fetchTags = async () => {
//       try {
//         const response = await api.get('/vendor/tags/tags/');
//         setTags(response.data.results);
//       } catch (error) {
//         console.error('Error fetching tags:', error);
//       }
//     };
//     fetchTags();
//   }, []);
//
//   const handleCreateTag = async () => {
//     try {
//       const response = await api.post('/vendor/tags/tags/create/', newTag);
//       setTags([...tags, response.data]);
//       setNewTag({ name: '', slug: '' });
//       setShowCreateModal(false);
//     } catch (error) {
//       console.error('Error creating tag:', error);
//     }
//   };
//
//   const handleEditTag = (tag: any) => {
//     setTagToEdit(tag);
//     setShowEditModal(true);
//   };
//
//   const handleUpdateTag = async () => {
//     try {
//       const response = await api.put(`/vendor/tags/tags/${tagToEdit.uuid}/manage/`, tagToEdit);
//       const updatedTags = tags.map((t) => t.uuid === tagToEdit.uuid ? response.data : t);
//       setTags(updatedTags);
//       setShowEditModal(false);
//       setTagToEdit(null);
//     } catch (error) {
//       console.error('Error updating tag:', error);
//     }
//   };
//
//   const handleDeleteTag = async (uuid: string) => {
//     try {
//       await api.delete(`/vendor/tags/tags/${uuid}/manage/`);
//       setTags(tags.filter((tag) => tag.uuid !== uuid));
//     } catch (error) {
//       console.error('Error deleting tag:', error);
//     }
//   };
//
//   return (
//     <Container>
//       <h4>Tags</h4>
//       <Button variant="primary" onClick={() => setShowCreateModal(true)}>Create Tag</Button>
//
//       <Row className="mt-3">
//         {tags.map((tag) => (
//           <Col key={tag.uuid} sm={4}>
//             <Card>
//               <Card.Body>
//                 <Card.Title>{tag.name}</Card.Title>
//                 <Card.Text>Slug: {tag.slug}</Card.Text>
//                 <Button variant="secondary" onClick={() => handleEditTag(tag)}>Edit</Button>
//                 <Button variant="danger" onClick={() => handleDeleteTag(tag.uuid)}>Delete</Button>
//               </Card.Body>
//             </Card>
//           </Col>
//         ))}
//       </Row>
//
//       {/* Create Tag Modal */}
//       <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Create New Tag</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group controlId="tagName">
//               <Form.Label>Tag Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={newTag.name}
//                 onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
//               />
//             </Form.Group>
//             <Form.Group controlId="tagSlug">
//               <Form.Label>Slug</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={newTag.slug}
//                 onChange={(e) => setNewTag({ ...newTag, slug: e.target.value })}
//               />
//             </Form.Group>
//             <Button variant="primary" onClick={handleCreateTag}>Create</Button>
//           </Form>
//         </Modal.Body>
//       </Modal>
//
//       {/* Edit Tag Modal */}
//       <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Edit Tag</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {tagToEdit && (
//             <Form>
//               <Form.Group controlId="tagName">
//                 <Form.Label>Tag Name</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={tagToEdit.name}
//                   onChange={(e) => setTagToEdit({ ...tagToEdit, name: e.target.value })}
//                 />
//               </Form.Group>
//               <Form.Group controlId="tagSlug">
//                 <Form.Label>Slug</Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={tagToEdit.slug}
//                   onChange={(e) => setTagToEdit({ ...tagToEdit, slug: e.target.value })}
//                 />
//               </Form.Group>
//               <Button variant="primary" onClick={handleUpdateTag}>Update</Button>
//             </Form>
//           )}
//         </Modal.Body>
//       </Modal>
//     </Container>
//   );
// };
//
// export default VendorTags;
