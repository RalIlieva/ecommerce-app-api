# wishlist/tests/test_wishlist_views.py

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from products.models import Product

User = get_user_model()

class WishlistViewsTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email="user@example.com", password="password123")
        self.product = Product.objects.create(name="Test Product", price=100.0, stock=5)
        self.client.force_authenticate(user=self.user)

    def test_get_wishlist(self):
        response = self.client.get(reverse('wishlist-detail'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 0)

    def test_add_product_to_wishlist(self):
        response = self.client.post(reverse('wishlist-add'), {'product_uuid': str(self.product.uuid)})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('detail', response.data)

    def test_remove_product_from_wishlist(self):
        # Add the product to wishlist first
        self.client.post(reverse('wishlist-add'), {'product_uuid': str(self.product.uuid)})

        # Remove product from wishlist
        response = self.client.delete(reverse('wishlist-remove', args=[str(self.product.uuid)]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_move_product_to_cart(self):
        # Add product to wishlist first
        self.client.post(reverse('wishlist-add'), {'product_uuid': str(self.product.uuid)})

        # Move product to cart
        response = self.client.post(reverse('wishlist-move-to-cart'), {'product_uuid': str(self.product.uuid)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('detail', response.data)
