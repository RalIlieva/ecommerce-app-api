# # wishlist/tests/test_wishlist_models.py
#
# from django.test import TestCase
# from django.contrib.auth import get_user_model
# from wishlist.models import Wishlist, WishlistItem
# from products.models import Product
#
# User = get_user_model()
#
# class WishlistModelTest(TestCase):
#
#     def setUp(self):
#         self.user = User.objects.create_user(email="user@example.com", password="password123")
#         self.product = Product.objects.create(name="Test Product", price=100.0, stock=5)
#
#     def test_create_wishlist(self):
#         wishlist = Wishlist.objects.create(user=self.user)
#         self.assertEqual(wishlist.user, self.user)
#         self.assertEqual(wishlist.items.count(), 0)
#
#     def test_add_item_to_wishlist(self):
#         wishlist = Wishlist.objects.create(user=self.user)
#         wishlist_item = WishlistItem.objects.create(wishlist=wishlist, product=self.product)
#         self.assertEqual(wishlist.items.count(), 1)
#         self.assertEqual(wishlist.items.first().product, self.product)
#
#     def test_unique_items_in_wishlist(self):
#         wishlist = Wishlist.objects.create(user=self.user)
#         WishlistItem.objects.create(wishlist=wishlist, product=self.product)
#
#         with self.assertRaises(Exception):  # Expecting IntegrityError
#             WishlistItem.objects.create(wishlist=wishlist, product=self.product)
