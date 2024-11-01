# wishlist/tests/test_wishlist_views.py

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from products.models import Product, Category

User = get_user_model()


class WishlistViewsTest(TestCase):
    """
    Test suite for the Wishlist API views, including adding, removing,
    retrieving, and moving items between wishlist and cart.
    """

    def setUp(self):
        """
        Initialize API client, authenticate user, and create test data:
        - Creates a test user and authenticates the client.
        - Adds a product to a category for testing wishlist functionalities.
        """
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="user@example.com",
            password="password123"
        )
        self.category = Category.objects.create(
            name='Electronics',
            slug='electronics'
        )
        self.product = Product.objects.create(
            name='Test Product', description='A great product', price=100.00,
            category=self.category, stock=20, slug='test-product')
        self.client.force_authenticate(user=self.user)

    def test_get_wishlist(self):
        """
        Test retrieving the wishlist for the authenticated user:
        - Checks the wishlist response status and
        verifies it returns an empty list initially.
        """
        response = self.client.get(reverse('wishlist:wishlist-detail'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 0)

    def test_add_product_to_wishlist(self):
        """
        Test adding a product to the wishlist:
        - Posts a product UUID to the wishlist endpoint.
        - Verifies successful addition by checking response status
        and detail message.
        """
        response = self.client.post(
            reverse('wishlist:wishlist-add'),
            {'product_uuid': self.product.uuid}
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('detail', response.data)

    def test_remove_product_from_wishlist(self):
        """
        Test removing a product from the wishlist:
        - Adds a product to the wishlist and then deletes it.
        - Ensures deletion response status is 204 NO CONTENT.
        """
        # Add the product to wishlist first
        self.client.post(
            reverse('wishlist:wishlist-add'),
            {'product_uuid': self.product.uuid}
        )

        # Remove product from wishlist
        response = self.client.delete(
            reverse('wishlist:wishlist-remove',
                    args=[self.product.uuid])
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_move_product_to_cart(self):
        """
        Test moving a product from the wishlist to the cart:
        - Adds a product to the wishlist, then moves it to the cart.
        - Verifies response status and presence of detail message.
        """
        # Add product to wishlist first
        self.client.post(
            reverse('wishlist:wishlist-add'),
            {'product_uuid': self.product.uuid}
        )

        # Move product to cart
        response = self.client.post(
            reverse('wishlist:wishlist-move-to-cart'),
            {'product_uuid': self.product.uuid}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('detail', response.data)
