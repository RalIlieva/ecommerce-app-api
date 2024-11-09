"""
Tests for Admin Order Views.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from uuid import uuid4
from products.models import Product, Category
from order.services import create_order


def admin_detail_url(order_uuid):
    """
    Create and return an order detail URL for admin with UUID.
    """
    return reverse('order:admin-order-detail', args=[order_uuid])


class AdminOrderDetailViewTests(TestCase):
    """
    Test suite for admin-specific order view operations.
    """

    def setUp(self):
        """
        Set up initial test data - users, category, product, and order.
        """
        self.client = APIClient()
        self.admin_user = get_user_model().objects.create_superuser(
            email='admin@example.com', password='adminpassword'
        )
        self.user = get_user_model().objects.create_user(
            email='user@example.com', password='password123'
        )
        self.category = Category.objects.create(
            name='Electronics', slug='electronics'
        )
        self.product = Product.objects.create(
            name='Test Product', description='A great product', price=100.00,
            category=self.category, stock=10, slug='test-product'
        )
        self.order = create_order(
            self.user, [{'product': self.product.uuid, 'quantity': 2}]
        )
        self.client.force_authenticate(self.admin_user)

    def test_update_order_status_with_valid_uuid(self):
        """
        Test updating the order status with a valid UUID to 'shipped'.
        """
        url = admin_detail_url(self.order.uuid)
        response = self.client.patch(url, {'status': 'shipped'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'shipped')

    def test_update_order_status_with_invalid_uuid(self):
        """
        Test updating the order status with an invalid UUID returns 404.
        """
        invalid_uuid = uuid4()  # Generates a new UUID
        url = admin_detail_url(invalid_uuid)
        response = self.client.patch(url, {'status': 'shipped'})

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_order_status_forbidden_to_non_admin_user(self):
        """
        Test that a non-admin user cannot update an order status.
        """
        # Authenticate as a non-admin user
        self.client.force_authenticate(self.user)
        url = admin_detail_url(self.order.uuid)
        response = self.client.patch(url, {'status': 'shipped'})

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cancel_order_as_admin(self):
        """
        Test canceling an order as an admin user.
        """
        url = admin_detail_url(self.order.uuid)
        response = self.client.patch(url, {'status': 'cancelled'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'cancelled')
