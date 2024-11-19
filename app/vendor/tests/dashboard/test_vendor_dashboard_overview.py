# vendor/tests/dashboard/test_vendor_dashboard_overview.py
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from products.models import Product, Category
from order.models import Order
from payment.models import Payment

DASHBOARD_OVERVIEW_URL = reverse('vendor:dashboard:dashboard-overview')


class VendorDashboardOverviewTests(TestCase):
    """
    Test suite for vendor dashboard overview API.
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
            stock=10,
            slug='test-product'
        )
        self.order = Order.objects.create(user=self.vendor_user)

        # # Sample payment for test revenue calculation
        # Payment.objects.create(
        #     order=self.order,
        #     amount=200.00,
        #     status='completed'
        # )

    def test_vendor_dashboard_overview(self):
        """
        Test that the vendor can successfully access their dashboard overview.
        """
        response = self.client.get(DASHBOARD_OVERVIEW_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Assert that the expected keys exist in the response
        expected_keys = [
            'total_products',
            'total_orders',
            # 'total_revenue'
        ]
        for key in expected_keys:
            self.assertIn(key, response.data)

        # # Optionally, you could also check the specific values
        # self.assertEqual(response.data['total_products'], 1)
        # self.assertEqual(response.data['total_orders'], 1)
        # self.assertEqual(response.data['total_revenue'], 200.00)
