# vendor/tests/dashboard/test_vendor_payment_views.py

from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from payment.models import Payment
from order.models import Order
from products.models import Product, Category

PAYMENTS_LIST_URL = reverse('vendor:dashboard:payment-list')


class VendorPaymentListViewTests(TestCase):
    """
    Test suite for vendor payment list API.
    """

    def setUp(self):
        self.client = APIClient()

        # Set up vendor group and user
        vendor_group, _ = Group.objects.get_or_create(name='vendor')
        self.vendor_user = get_user_model().objects.create_user(
            email='vendor@example.com',
            password='vendorpassword'
        )
        self.vendor_user.groups.add(vendor_group)

        # Authenticate the client with the vendor user
        self.client.force_authenticate(self.vendor_user)

        # Set up initial data
        self.category = Category.objects.create(
            name="Electronics",
            slug="electronics"
        )
        self.product = Product.objects.create(
            name='Test Product',
            price=100.00,
            category=self.category,
            stock=20,
            slug='test-product'
        )
        # Create a test user
        self.user = get_user_model().objects.create_user(
            email="testuser@example.com",
            password="password123"
        )

        self.order = Order.objects.create(user=self.user)

        # Sample payment for test revenue calculation
        Payment.objects.create(
            order=self.order,
            user=self.user,
            amount=100.00,
            status='completed'
        )

    def test_vendor_payment_list(self):
        """
        Test retrieving a list of payments related to vendor orders.
        """
        response = self.client.get(PAYMENTS_LIST_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['amount'], '100.00')
