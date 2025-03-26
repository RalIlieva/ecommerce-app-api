import React, { useState, useEffect } from 'react';
import { Button, Card, Container, Row, Col, Modal, Form, Spinner } from 'react-bootstrap';
import api from '../../api';

const VendorCategories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryToEdit, setCategoryToEdit] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', parent: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/vendor/categories/categories/');
        setCategories(response.data.results);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/vendor/categories/categories/create/', newCategory);
      setCategories([...categories, response.data]);
      setNewCategory({ name: '', slug: '', parent: '' });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = (category: any) => {
    setCategoryToEdit(category);
    setShowEditModal(true);
  };

  const handleUpdateCategory = async () => {
    setIsLoading(true);
    try {
      const response = await api.put(`/vendor/categories/categories/${categoryToEdit.uuid}/manage/`, categoryToEdit);
      const updatedCategories = categories.map((cat) => (cat.uuid === categoryToEdit.uuid ? response.data : cat));
      setCategories(updatedCategories);
      setShowEditModal(false);
      setCategoryToEdit(null);
    } catch (error) {
      console.error('Error updating category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = (category: any) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsLoading(true);
    try {
      await api.delete(`/vendor/categories/categories/${categoryToDelete.uuid}/manage/`);
      setCategories(categories.filter((category) => category.uuid !== categoryToDelete.uuid));
      setShowDeleteModal(false);  // Close the modal after deletion
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setCategoryToDelete(null);
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <h4>Categories</h4>
      <Button variant="primary" onClick={() => setShowCreateModal(true)}>Create Category</Button>

      <Row className="mt-3">
        {categories.map((category) => (
          <Col key={category.uuid} sm={4}>
            <Card>
              <Card.Body>
                <Card.Title>{category.name}</Card.Title>
                <Card.Text>Slug: {category.slug}</Card.Text>
                <Button variant="secondary" onClick={() => handleEditCategory(category)}>Edit</Button>
                <Button variant="danger" onClick={() => handleConfirmDelete(category)}>Delete</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Spinner for loading state */}
      {isLoading && <div className="text-center"><Spinner animation="border" variant="primary" /></div>}

      {/* Create Category Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="categoryName">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="categorySlug">
              <Form.Label>Slug</Form.Label>
              <Form.Control
                type="text"
                value={newCategory.slug}
                onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
              />
            </Form.Group>
            <Button variant="primary" onClick={handleCreateCategory}>Create</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Category Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {categoryToEdit && (
            <Form>
              <Form.Group controlId="categoryName">
                <Form.Label>Category Name</Form.Label>
                <Form.Control
                  type="text"
                  value={categoryToEdit.name}
                  onChange={(e) => setCategoryToEdit({ ...categoryToEdit, name: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="categorySlug">
                <Form.Label>Slug</Form.Label>
                <Form.Control
                  type="text"
                  value={categoryToEdit.slug}
                  onChange={(e) => setCategoryToEdit({ ...categoryToEdit, slug: e.target.value })}
                />
              </Form.Group>
              <Button variant="primary" onClick={handleUpdateCategory}>Update</Button>
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
          Are you sure you want to delete <strong>{categoryToDelete?.name}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteCategory}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default VendorCategories;
