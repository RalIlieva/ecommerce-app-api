from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from uuid import uuid4
# from order.models import Order, OrderItem
from products.models import Product, Category
from order.services import (
    create_order,
    # update_order_status
)


class OrderDetailViewTests(TestCase):
    def setUp(self):
        # Set up the API client and users
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            email='user@example.com', password='password123'
        )
        self.other_user = get_user_model().objects.create_user(
            email='otheruser@example.com', password='password123'
        )

        # Create a category and a product
        self.category = Category.objects.create(
            name='Electronics',
            slug='electronics'
        )
        self.product = Product.objects.create(
            name='Test Product', description='A great product', price=100.00,
            category=self.category, stock=10, slug='test-product'
        )

        # Create an order for the user
        self.order = create_order(
            self.user, [{'product': self.product, 'quantity': 2}]
        )
        self.client.force_authenticate(self.user)

    def test_retrieve_order_with_valid_uuid(self):
        # Test retrieving the order using a valid UUID
        url = f'/api/orders/{self.order.uuid}/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['uuid'], str(self.order.uuid))
        self.assertEqual(response.data['user'], self.user.id)
        self.assertEqual(response.data['status'], 'pending')

    def test_retrieve_order_with_invalid_uuid(self):
        # Test retrieving an order with an invalid UUID
        invalid_uuid = uuid4()  # Generates a new UUID
        url = f'/api/orders/{invalid_uuid}/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_retrieve_order_forbidden_to_other_user(self):
        # Authenticate as a different user and attempt to retrieve the order
        self.client.force_authenticate(self.other_user)
        url = f'/api/orders/{self.order.uuid}/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_order_status_with_valid_uuid(self):
        # Test updating the order status with a valid UUID
        url = f'/api/orders/{self.order.uuid}/'
        response = self.client.patch(url, {'status': 'shipped'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'shipped')

    def test_update_order_status_with_invalid_uuid(self):
        # Test updating the order status with an invalid UUID
        invalid_uuid = uuid4()  # Generates a new UUID
        url = f'/api/orders/{invalid_uuid}/'
        response = self.client.patch(url, {'status': 'shipped'})

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_order_status_forbidden_to_other_user(self):
        # Authenticate as a diff user & attempt to update the order status
        self.client.force_authenticate(self.other_user)
        url = f'/api/orders/{self.order.uuid}/'
        response = self.client.patch(url, {'status': 'shipped'})

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
