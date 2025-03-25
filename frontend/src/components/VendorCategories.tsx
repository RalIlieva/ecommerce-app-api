import React, { useState, useEffect } from 'react';
import { Button, Card, Container, Row, Col, Modal, Form } from 'react-bootstrap';
import api from '../../api';

const VendorCategories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryToEdit, setCategoryToEdit] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', parent: '' });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/vendor/categories/');
        setCategories(response.data.results);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    try {
      const response = await api.post('/vendor/categories/create/', newCategory);
      setCategories([...categories, response.data]);
      setNewCategory({ name: '', slug: '', parent: '' });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleEditCategory = (category: any) => {
    setCategoryToEdit(category);
    setShowEditModal(true);
  };

  const handleUpdateCategory = async () => {
    try {
      const response = await api.put(`/vendor/categories/${categoryToEdit.uuid}/manage/`, categoryToEdit);
      const updatedCategories = categories.map((cat) => cat.uuid === categoryToEdit.uuid ? response.data : cat);
      setCategories(updatedCategories);
      setShowEditModal(false);
      setCategoryToEdit(null);
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (uuid: string) => {
    try {
      await api.delete(`/vendor/categories/${uuid}/manage/`);
      setCategories(categories.filter((category) => category.uuid !== uuid));
    } catch (error) {
      console.error('Error deleting category:', error);
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
                <Button variant="danger" onClick={() => handleDeleteCategory(category.uuid)}>Delete</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

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
    </Container>
  );
};

export default VendorCategories;
