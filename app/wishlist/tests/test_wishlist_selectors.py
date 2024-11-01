# wishlist/tests/test_wishlist_selectors.py

from django.test import TestCase
from django.contrib.auth import get_user_model
from products.models import Product, Category
from wishlist.models import WishlistItem
from wishlist.selectors import (
    get_user_wishlist,
    get_wishlist_items,
    get_wishlist_item_by_product
)

User = get_user_model()


class WishlistSelectorsTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="user@example.com", password="password123"
        )
        self.category = Category.objects.create(
            name='Electronics', slug='electronics'
        )
        self.product = Product.objects.create(
            name='Test Product',
            price=100.0, stock=5,
            category=self.category
        )
        self.wishlist = get_user_wishlist(self.user)
        self.wishlist_item = WishlistItem.objects.create(
            wishlist=self.wishlist,
            product=self.product
        )

    def test_get_user_wishlist(self):
        wishlist = get_user_wishlist(self.user)
        self.assertEqual(wishlist.user, self.user)

    def test_get_wishlist_items(self):
        items = get_wishlist_items(self.user)
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0], self.wishlist_item)

    def test_get_wishlist_item_by_product(self):
        item = get_wishlist_item_by_product(self.user, self.product.uuid)
        self.assertEqual(item, self.wishlist_item)
