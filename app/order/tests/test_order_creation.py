"""
Test for creating order.
"""

from uuid import uuid4
from django.urls import reverse
from rest_framework import status
from products.models import Product
from order.models import Order
from .test_base import OrderTestBase


ORDER_CREATE_URL = reverse('order:order-create')


class OrderCreationTestCase(OrderTestBase):
    """
    Test suite for creating orders with different scenarios.
    Inherits common setup and helper methods from OrderTestBase.
    """

    def test_create_order_with_sufficient_stock(self):
        """
        Test creating an order with sufficient stock available.
        """
        payload = {
            'items': [{'product': str(self.product.uuid), 'quantity': 2}],
            'shipping_address': {
                'full_name': "Test User",
                'address_line_1': "123 Test Street",
                'address_line_2': "Apt 1",
                'city': "Test City",
                'postal_code': "12345",
                'country': "Testland",
                'phone_number': "+359883368888"
            }
        }
        response = self.client.post(ORDER_CREATE_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(Order.objects.first().order_items.count(), 1)

    def test_create_order_with_exact_stock(self):
        """
        Test creating an order - quantity exactly equal to the available stock.
        """
        # Exact available stock - 20 pcs per test base
        payload = {
            'items': [{'product': str(self.product.uuid), 'quantity': 20}],
            'shipping_address': {
                'full_name': "Test User",
                'address_line_1': "123 Test Street",
                'address_line_2': "Apt 1",
                'city': "Test City",
                'postal_code': "12345",
                'country': "Testland",
                'phone_number': "+359883368888"
            }
        }
        response = self.client.post(ORDER_CREATE_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(
            Order.objects.first().order_items.first().quantity, 20
        )
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 0)  # Stock should be zero now

    def test_create_order_with_invalid_product_uuid(self):
        """
        Test creating an order with an invalid product UUID.
        """
        invalid_uuid = uuid4()
        payload = {
            'items': [{'product': str(invalid_uuid), 'quantity': 1}],
            'shipping_address': {
                'full_name': "Test User",
                'address_line_1': "123 Test Street",
                'address_line_2': "Apt 1",
                'city': "Test City",
                'postal_code': "12345",
                'country': "Testland",
                'phone_number': "+359883368888"
            }
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
            ],
            'shipping_address': {
                'full_name': "Test User",
                'address_line_1': "123 Test Street",
                'address_line_2': "Apt 1",
                'city': "Test City",
                'postal_code': "12345",
                'country': "Testland",
                'phone_number': "+359883368888"
            }
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
            'items': [{'product': str(self.product.uuid), 'quantity': 0}],
            'shipping_address': {
                'full_name': "Test User",
                'address_line_1': "123 Test Street",
                'address_line_2': "Apt 1",
                'city': "Test City",
                'postal_code': "12345",
                'country': "Testland",
                'phone_number': "+359883368888"
            }
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
            'items': [{'product': str(self.product.uuid), 'quantity': 1000}],
            'shipping_address': {
                'full_name': "Test User",
                'address_line_1': "123 Test Street",
                'address_line_2': "Apt 1",
                'city': "Test City",
                'postal_code': "12345",
                'country': "Testland",
                'phone_number': "+359883368888"
            }
        }
        response = self.client.post(ORDER_CREATE_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            'Not enough stock available',
            str(response.data['detail'])
        )
        self.assertEqual(Order.objects.count(), 0)
