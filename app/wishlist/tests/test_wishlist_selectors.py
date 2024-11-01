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
    """
    Test suite for Wishlist selectors that retrieve wishlist information
    for a given user, incl. retrieving the wishlist, items in the wishlist,
    and specific wishlist items by product.
    """

    def setUp(self):
        """
        Set up test data, including:
        - A test user who will own the wishlist.
        - A product in a specific category.
        - A wishlist linked to the test user &
        containing the product as an item.
        """
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
        """
        Test that `get_user_wishlist` retrieves the correct wishlist for the user:
        - Verifies that the returned wishlist belongs to the test user.
        """
        wishlist = get_user_wishlist(self.user)
        self.assertEqual(wishlist.user, self.user)

    def test_get_wishlist_items(self):
        """
        Test that `get_wishlist_items` retrieves all items in the user's wishlist:
        - Checks that the returned items list contains the expected wishlist item.
        """
        items = get_wishlist_items(self.user)
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0], self.wishlist_item)

    def test_get_wishlist_item_by_product(self):
        """
        Test that `get_wishlist_item_by_product` retrieves the correct item
        by product UUID from the wishlist:
        - Ensures the correct wishlist item is returned for a given product.
        """
        item = get_wishlist_item_by_product(self.user, self.product.uuid)
        self.assertEqual(item, self.wishlist_item)
