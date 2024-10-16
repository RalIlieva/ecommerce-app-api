"""
Tests for order selectors.
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from order.models import Order
from order.selectors import (
    get_user_orders,
    get_order_details
)
from uuid import uuid4


class OrderSelectorTestCase(TestCase):

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email='testuser@example.com',
            password='password123'
        )
        self.order1 = Order.objects.create(user=self.user)
        self.order2 = Order.objects.create(user=self.user)

    def test_get_user_orders(self):
        orders = get_user_orders(self.user)
        self.assertEqual(len(orders), 2)
        self.assertIn(self.order1, orders)
        self.assertIn(self.order2, orders)

    def test_get_order_details(self):
        order = get_order_details(self.order1.uuid)
        self.assertEqual(order.uuid, self.order1.uuid)

    def test_get_order_details_invalid_uuid(self):
        with self.assertRaises(Order.DoesNotExist):
            get_order_details(uuid4())
