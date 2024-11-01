# wishlist/tests/test_wishlist_services.py

import uuid
from rest_framework.exceptions import ValidationError, NotFound
from rest_framework import status
from django.urls import reverse
from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from wishlist.services import (
    get_or_create_wishlist,
    add_product_to_wishlist,
    remove_product_from_wishlist,
    move_wishlist_item_to_cart
)
from products.models import Product, Category
from rest_framework.exceptions import ValidationError, NotFound
from cart.models import CartItem

User = get_user_model()


class WishlistServiceTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(email="user@example.com", password="password123")
        self.category = Category.objects.create(
            name='Electronics',
            slug='electronics'
        )
        self.product = Product.objects.create(
            name='Test Product', description='A great product', price=100.00,
            category=self.category, stock=20, slug='test-product')

    def test_get_or_create_wishlist(self):
        wishlist = get_or_create_wishlist(self.user)
        self.assertEqual(wishlist.user, self.user)
        self.assertEqual(wishlist.items.count(), 0)

    def test_add_product_to_wishlist(self):
        add_product_to_wishlist(self.user, self.product.uuid)
        wishlist = get_or_create_wishlist(self.user)
        self.assertEqual(wishlist.items.count(), 1)
        self.assertEqual(wishlist.items.first().product, self.product)

    def test_add_duplicate_product_to_wishlist(self):
        add_product_to_wishlist(self.user, self.product.uuid)
        with self.assertRaises(ValidationError):
            add_product_to_wishlist(self.user, self.product.uuid)

    def test_remove_product_from_wishlist(self):
        add_product_to_wishlist(self.user, self.product.uuid)
        remove_product_from_wishlist(self.user, self.product.uuid)
        wishlist = get_or_create_wishlist(self.user)
        self.assertEqual(wishlist.items.count(), 0)

    def test_remove_nonexistent_product_from_wishlist(self):
        # Generate a valid UUID that doesn't exist in the database
        non_existent_uuid = uuid.uuid4()

        with self.assertRaises(NotFound):
            remove_product_from_wishlist(self.user, non_existent_uuid)

    def test_move_wishlist_item_to_cart(self):
        add_product_to_wishlist(self.user, self.product.uuid)
        move_wishlist_item_to_cart(self.user, self.product.uuid)
        self.assertTrue(CartItem.objects.filter(cart__user=self.user, product=self.product).exists())
        wishlist = get_or_create_wishlist(self.user)
        self.assertEqual(wishlist.items.count(), 0)


class UnauthorizedWishlistAccessTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name='Electronics', slug='electronics')
        self.product = Product.objects.create(name='Test Product', price=100.0, stock=5, category=self.category)

    def test_unauthorized_access_to_wishlist(self):
        response = self.client.get(reverse('wishlist:wishlist-detail'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthorized_add_to_wishlist(self):
        response = self.client.post(reverse('wishlist:wishlist-add'), {'product_uuid': str(self.product.uuid)})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
