"""
Tests for order status.
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from order.models import Order
from rest_framework.test import APIClient
from rest_framework import status


class OrderStatusTestCase(TestCase):
    """Test suite for updating the status of an order."""

    def setUp(self):
        """Set up initial test data, including user, order, and authentication."""
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            email='testuser@example.com',
            password='password123'
        )
        self.client.force_authenticate(self.user)
        self.order = Order.objects.create(user=self.user)
        self.order_status_url = f'/api/orders/{self.order.uuid}/'

    def test_update_order_status_to_paid(self):
        """Test updating an order status to 'paid'."""
        payload = {'status': 'paid'}
        response = self.client.patch(self.order_status_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'paid')

    def test_update_order_status_to_shipped(self):
        """Test updating an order status from 'paid' to 'shipped'."""
        self.order.status = Order.PAID
        self.order.save()
        payload = {'status': 'shipped'}
        response = self.client.patch(self.order_status_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'shipped')

    def test_update_order_status_to_cancelled(self):
        """Test updating an order status to 'cancelled'."""
        payload = {'status': 'cancelled'}
        response = self.client.patch(self.order_status_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'cancelled')
