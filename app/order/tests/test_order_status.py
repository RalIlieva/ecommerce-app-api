"""
Tests for order status.
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from order.models import Order
from rest_framework.test import APIClient
from rest_framework import status
from uuid import uuid4


def detail_url(order_uuid):
    """
    Create and return an order detail URL with UUID.
    """
    return reverse('order:order-detail', args=[order_uuid])


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
        # self.order_status_url = f'/api/orders/{self.order.uuid}/'

    def test_update_order_status_to_paid(self):
        """Test updating an order status to 'paid'."""
        url = detail_url(self.order.uuid)
        payload = {'status': 'paid'}
        response = self.client.patch(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'paid')

    def test_update_order_status_to_shipped(self):
        """Test updating an order status from 'paid' to 'shipped'."""
        self.order.status = Order.PAID
        self.order.save()
        url = detail_url(self.order.uuid)
        payload = {'status': 'shipped'}
        response = self.client.patch(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'shipped')

    def test_update_order_status_to_cancelled(self):
        """Test updating an order status to 'cancelled'."""
        url = detail_url(self.order.uuid)
        payload = {'status': 'cancelled'}
        response = self.client.patch(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'cancelled')

    def test_update_order_status_with_invalid_uuid(self):
        """Test updating the order status with an invalid UUID."""
        invalid_uuid = uuid4()  # Generates a new UUID
        url = detail_url(invalid_uuid)
        payload = {'status': 'shipped'}
        response = self.client.patch(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_order_status_forbidden_to_other_user(self):
        """Test that another user cannot update someone else's order status."""
        other_user = get_user_model().objects.create_user(
            email='otheruser@example.com',
            password='password123'
        )
        self.client.force_authenticate(other_user)
        url = detail_url(self.order.uuid)
        payload = {'status': 'shipped'}
        response = self.client.patch(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
