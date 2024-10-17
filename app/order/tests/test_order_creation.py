"""
Test for creating order.
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from products.models import Category, Product
from order.models import Order
from uuid import uuid4


ORDER_CREATE_URL = reverse('order:order-create')


class OrderCreationTestCase(TestCase):
    """
    Test suite for creating orders with different scenarios.
    """

    def setUp(self):
        """
        Set up initial test data, including user, product, and authentication.
        """
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            email='testuser@example.com',
            password='password123'
        )
        self.category = Category.objects.create(
            name='Electronics',
            slug='electronics'
        )
        self.product = Product.objects.create(
            name='Test Product',
            description='A great product',
            price=100.00,
            category=self.category,
            stock=5,
            slug='test-product'
        )
        self.client.force_authenticate(self.user)

    def test_create_order_with_sufficient_stock(self):
        """
        Test creating an order with sufficient stock available.
        """
        payload = {
            'items': [{'product': str(self.product.uuid), 'quantity': 2}]
        }
        response = self.client.post(ORDER_CREATE_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(Order.objects.first().order_items.count(), 1)

    def test_create_order_with_exact_stock(self):
        """
        Test creating an order - quantity exactly equal to the available stock.
        """
        # Exact available stock
        payload = {
            'items': [{'product': str(self.product.uuid), 'quantity': 5}]
        }
        response = self.client.post(ORDER_CREATE_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(Order.objects.first().order_items.first().quantity, 5)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 0)  # Stock should be zero now

    def test_create_order_with_invalid_product_uuid(self):
        """
        Test creating an order with an invalid product UUID.
        """
        invalid_uuid = uuid4()
        payload = {
            'items': [{'product': str(invalid_uuid), 'quantity': 1}]
        }
        response = self.client.post(ORDER_CREATE_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Product with UUID', str(response.data['detail']))
        self.assertEqual(Order.objects.count(), 0)

    def test_create_order_with_multiple_items(self):
        """
        Test creating an order with multiple different items.
        """
        product2 = Product.objects.create(
            name='Second Product',
            description='Another great product',
            price=150.00,
            category=self.category,
            stock=3,
            slug='second-product'
        )
        payload = {
            'items': [
                {'product': str(self.product.uuid), 'quantity': 3},
                {'product': str(product2.uuid), 'quantity': 2}
            ]
        }
        response = self.client.post(ORDER_CREATE_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(Order.objects.first().order_items.count(), 2)

    def test_create_order_with_zero_quantity(self):
        """
        Test creating an order with a quantity of zero, which should fail.
        """
        payload = {
            'items': [{'product': str(self.product.uuid), 'quantity': 0}]
        }
        response = self.client.post(ORDER_CREATE_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            'Quantity must be greater than zero',
            str(response.data['detail'])
        )
        self.assertEqual(Order.objects.count(), 0)

    def test_create_empty_order(self):
        """
        Test that creating an order with no items fails with 400 Bad Request.
        """
        payload = {
            'items': []  # No items in the order
        }
        response = self.client.post(ORDER_CREATE_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Items must not be empty', str(response.data['detail']))
        self.assertEqual(Order.objects.count(), 0)

    def test_create_order_with_negative_quantity(self):
        """
        Test that creating an order with a negative quantity fails with 400.
        """
        payload = {
            'items': [{'product': str(self.product.uuid), 'quantity': -1}]
        }
        response = self.client.post(ORDER_CREATE_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            'Quantity must be greater than zero',
            str(response.data['detail'])
        )
        self.assertEqual(Order.objects.count(), 0)

    def test_create_order_with_high_quantity(self):
        """
        Test creating an order with high quantity fails if stock insufficient.
        """
        payload = {
            'items': [{'product': str(self.product.uuid), 'quantity': 1000}]
        }
        response = self.client.post(ORDER_CREATE_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            'Not enough stock available',
            str(response.data['detail'])
        )
        self.assertEqual(Order.objects.count(), 0)
