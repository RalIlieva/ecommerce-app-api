"""
Base test class.
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from products.models import Category, Product
from order.models import Order
from order.services import create_order

ORDERS_URL = reverse('order:order-list')
ORDER_CREATE_URL = reverse('order:order-create')


class OrderTestBase(TestCase):
    """Base test class for orders, includes setup utilities."""

    def setUp(self):
        """Set up a user, category, product, and authenticate the client."""
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            email='testuser@example.com', password='password123'
        )
        self.category = Category.objects.create(
            name='Electronics',
            slug='electronics'
        )
        self.product = Product.objects.create(
            name='Test Product', description='A great product', price=100.00,
            category=self.category, stock=20, slug='test-product'
        )
        self.client.force_authenticate(self.user)

    def create_order(self, user, items):
        """Helper to create an order for testing purposes."""
        return create_order(user, items)

    def create_user(self, email, password):
        """Helper to create a user."""
        return get_user_model().objects.create_user(
            email=email, password=password
        )


class OrderCreationTestCase(OrderTestBase):
    """Test suite for creating orders using Order Create View."""

    def test_create_order_with_valid_data(self):
        """Test creating an order with valid data."""
        payload = {
            'items': [{'product': str(self.product.uuid), 'quantity': 2}]
        }
        response = self.client.post(ORDER_CREATE_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)
