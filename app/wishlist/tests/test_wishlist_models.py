from django.test import TestCase
from django.contrib.auth import get_user_model
from wishlist.models import Wishlist, WishlistItem
from products.models import Product, Category

User = get_user_model()


class WishlistModelTest(TestCase):

    def setUp(self):
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

    def test_create_wishlist(self):
        wishlist = Wishlist.objects.create(user=self.user)
        self.assertEqual(wishlist.user, self.user)
        self.assertEqual(wishlist.items.count(), 0)

    def test_add_item_to_wishlist(self):
        wishlist = Wishlist.objects.create(user=self.user)
        WishlistItem.objects.create(
            wishlist=wishlist,
            product=self.product
        )
        self.assertEqual(wishlist.items.count(), 1)
        self.assertEqual(wishlist.items.first().product, self.product)

    def test_unique_items_in_wishlist(self):
        wishlist = Wishlist.objects.create(user=self.user)
        WishlistItem.objects.create(
            wishlist=wishlist,
            product=self.product
        )
        # Expecting IntegrityError
        with self.assertRaises(Exception):
            WishlistItem.objects.create(
                wishlist=wishlist,
                product=self.product
            )
