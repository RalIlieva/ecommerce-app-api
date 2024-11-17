"""
Tests for Vendor Order Views.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from uuid import uuid4
from products.models import Product, Category
from order.services import create_order
from django.contrib.auth.models import Group

def vendor_detail_url(order_uuid):
    """
    Create and return an order detail URL for vendor with UUID.
    """
    return reverse('vendor:orders:vendor-order-detail', args=[order_uuid])


class VendorOrderDetailViewTests(TestCase):
    """
    Test suite for vendor-specific order view operations.
    """

    def setUp(self):
        """
        Set up initial test data - users, category, product, and order.
        """
        self.client = APIClient()

        # Create vendor group and user
        vendor_group, created = Group.objects.get_or_create(name='vendor')
        self.vendor_user = get_user_model().objects.create_user(
            email='vendor@example.com', password='vendorpassword'
        )
        self.vendor_user.groups.add(vendor_group)
        self.client.force_authenticate(self.vendor_user)

        # Create regular user and an order
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

    def test_update_order_status_with_valid_uuid(self):
        """
        Test updating the order status with a valid UUID to 'shipped' by vendor.
        """
        url = vendor_detail_url(self.order.uuid)
        response = self.client.patch(url, {'status': 'shipped'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'shipped')

    def test_update_order_status_with_invalid_uuid(self):
        """
        Test updating the order status with an invalid UUID returns 404.
        """
        invalid_uuid = uuid4()  # Generates a new UUID
        url = vendor_detail_url(invalid_uuid)
        response = self.client.patch(url, {'status': 'shipped'})

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_order_status_forbidden_to_non_vendor_user(self):
        """
        Test that a non-vendor user cannot update an order status.
        """
        # Authenticate as a non-vendor user
        non_vendor_user = get_user_model().objects.create_user(
            email='nonvendor@example.com', password='password123'
        )
        self.client.force_authenticate(non_vendor_user)
        url = vendor_detail_url(self.order.uuid)
        response = self.client.patch(url, {'status': 'shipped'})

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cancel_order_as_vendor(self):
        """
        Test canceling an order as a vendor.
        """
        url = vendor_detail_url(self.order.uuid)
        response = self.client.patch(url, {'status': 'cancelled'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'cancelled')
