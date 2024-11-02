from django.test import TestCase
from django.contrib.auth import get_user_model
from wishlist.models import Wishlist, WishlistItem
from products.models import Product, Category

User = get_user_model()


class WishlistModelTest(TestCase):
    """
    Test suite for the Wishlist and WishlistItem models.
    Validates wishlist creation, item addition, and uniqueness constraints.
    """

    def setUp(self):
        """
        Set up test dependencies:
        - Creates a user for associating with the wishlist.
        - Sets up a sample category and product for adding to the wishlist.
        """
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
        """
        Test wishlist creation:
        - Creates a wishlist associated with a user.
        - Asserts that the wishlist is correctly associated with the user.
        - Ensures the wishlist is initially empty.
        """
        wishlist = Wishlist.objects.create(user=self.user)
        self.assertEqual(wishlist.user, self.user)
        self.assertEqual(wishlist.items.count(), 0)

    def test_add_item_to_wishlist(self):
        """
        Test adding an item to the wishlist:
        - Creates a wishlist and adds a product to it.
        - Verifies that the product is successfully added to the wishlist.
        - Asserts that the product count in the wishlist is as expected.
        """
        wishlist = Wishlist.objects.create(user=self.user)
        WishlistItem.objects.create(
            wishlist=wishlist,
            product=self.product
        )
        self.assertEqual(wishlist.items.count(), 1)
        self.assertEqual(wishlist.items.first().product, self.product)

    def test_unique_items_in_wishlist(self):
        """
        Test uniqueness constraint on wishlist items:
        - Adds a product to the wishlist.
        - Attempts to add the same product again, expecting an IntegrityError.
        - Verifies duplicate products cannot be added to the same wishlist.
        """
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
