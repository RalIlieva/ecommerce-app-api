# vendor/tests/dashboard/test_vendor_wishlist_views.py

from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from wishlist.models import Wishlist, WishlistItem
from products.models import Product, Category

WISHLIST_LIST_URL = reverse('vendor:dashboard:wishlist-list')


class VendorWishlistViewTests(TestCase):
    """
    Test suite for vendor wishlist API.
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
            stock=15,
            category=self.category,
            slug='test-product'
        )
        # Create a test user
        self.user = get_user_model().objects.create_user(
            email="testuser@example.com",
            password="password123"
        )
        self.wishlist = Wishlist.objects.create(
            user=self.user
        )

        # Create a WishlistItem for this Wishlist
        WishlistItem.objects.create(
            wishlist=self.wishlist,
            product=self.product,
        )

    def test_vendor_wishlist_list(self):
        """
        Test retrieving a list of products on the wishlist.
        """
        response = self.client.get(WISHLIST_LIST_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(
            response.data['results'][0]['product']['name'],
            'Test Product'
        )
