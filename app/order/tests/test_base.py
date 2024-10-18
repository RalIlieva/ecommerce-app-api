"""
Base test class.
"""

from threading import Thread
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from products.models import Category, Product
from order.models import Order
from order.services import create_order
from uuid import uuid4

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
        return get_user_model().objects.create_user(email=email, password=password)


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

    def test_list_orders_pagination(self):
        """Test that the order list API supports pagination."""
        # Create several orders
        for _ in range(15):
            self.create_order(self.user, [{'product': self.product.uuid, 'quantity': 1}])

        response = self.client.get(ORDERS_URL + '?page=1&page_size=10')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 10)  # Page size of 10

    def test_list_orders_filter_status(self):
        """Test filtering orders by status."""
        shipped_order = create_order(self.user, [{'product': self.product.uuid, 'quantity': 1}])
        shipped_order.status = Order.SHIPPED
        shipped_order.save()

        response = self.client.get(ORDERS_URL + '?status=shipped')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['uuid'], str(shipped_order.uuid))

    # def test_prevent_overselling(self):
    #     """Test that overselling is prevented when two users attempt to buy the same product simultaneously."""
    #
    #     def place_order():
    #         payload = {
    #             'items': [{'product': str(self.product.uuid), 'quantity': 5}]
    #         }
    #         response = self.client.post(ORDER_CREATE_URL, payload, format='json')
    #         return response
    #
    #     # Stock is 10, so two simultaneous orders of 5 should succeed, but no more
    #     thread1 = Thread(target=place_order)
    #     thread2 = Thread(target=place_order)
    #
    #     thread1.start()
    #     thread2.start()
    #
    #     thread1.join()
    #     thread2.join()
    #
    #     self.assertEqual(Order.objects.count(), 2)
    #     self.product.refresh_from_db()
    #     self.assertEqual(self.product.stock, 0)
