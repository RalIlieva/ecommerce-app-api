# wishlist/tests/test_wishlist_services.py

from django.test import TestCase
from django.contrib.auth import get_user_model
from wishlist.services import (
    get_or_create_wishlist,
    add_product_to_wishlist,
    remove_product_from_wishlist,
    move_wishlist_item_to_cart
)
from products.models import Product
from rest_framework.exceptions import ValidationError, NotFound
from cart.models import CartItem

User = get_user_model()

class WishlistServiceTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(email="user@example.com", password="password123")
        self.product = Product.objects.create(name="Test Product", price=100.0, stock=5)

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
        with self.assertRaises(NotFound):
            remove_product_from_wishlist(self.user, 'nonexistent-uuid')

    def test_move_wishlist_item_to_cart(self):
        add_product_to_wishlist(self.user, self.product.uuid)
        move_wishlist_item_to_cart(self.user, self.product.uuid)
        self.assertTrue(CartItem.objects.filter(cart__user=self.user, product=self.product).exists())
        wishlist = get_or_create_wishlist(self.user)
        self.assertEqual(wishlist.items.count(), 0)
