import uuid
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
from core.exceptions import (
    ProductAlreadyInWishlistException,
    ProductNotInWishlistException
)
from products.models import Product, Category
from cart.models import CartItem

User = get_user_model()


class WishlistServiceTest(TestCase):
    """
    Test suite for wishlist service functions.
    Includes tests for creating a wishlist,
    adding/removing products, and moving items to the cart.
    """

    def setUp(self):
        """
        Set up initial user, category, and product instances for testing.
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

    def test_get_or_create_wishlist(self):
        """
        Test the retrieval or creation of a wishlist:
        - Ensures that a wishlist is associated with the user.
        - Verifies that a new wishlist starts with zero items.
        """
        wishlist = get_or_create_wishlist(self.user)
        self.assertEqual(wishlist.user, self.user)
        self.assertEqual(wishlist.items.count(), 0)

    def test_add_product_to_wishlist(self):
        """
        Test adding a product to the wishlist:
        - Adds a product to the user's wishlist.
        - Verifies that the product count in the wishlist is updated.
        """
        add_product_to_wishlist(self.user, self.product.uuid)
        wishlist = get_or_create_wishlist(self.user)
        self.assertEqual(wishlist.items.count(), 1)
        self.assertEqual(wishlist.items.first().product, self.product)

    def test_add_duplicate_product_to_wishlist(self):
        """
        Test duplicate product addition:
        - Adds a product to the wishlist.
        - Attempts to add the same product again, expecting a ValidationError.
        """
        add_product_to_wishlist(self.user, self.product.uuid)
        with self.assertRaises(ProductAlreadyInWishlistException):
            add_product_to_wishlist(self.user, self.product.uuid)

    def test_remove_product_from_wishlist(self):
        """
        Test product removal from the wishlist:
        - Adds a product to the wishlist, then removes it.
        - Ensures the product count in the wishlist returns to zero.
        """
        add_product_to_wishlist(self.user, self.product.uuid)
        remove_product_from_wishlist(self.user, self.product.uuid)
        wishlist = get_or_create_wishlist(self.user)
        self.assertEqual(wishlist.items.count(), 0)

    def test_remove_nonexistent_product_from_wishlist(self):
        """
        Test removal of a non-existent product:
        - Tries to remove a product that doesn’t exist in the wishlist.
        - Expects a NotFound exception.
        """
        # Generate a valid UUID that doesn't exist in the database
        non_existent_uuid = uuid.uuid4()

        with self.assertRaises(ProductNotInWishlistException):
            remove_product_from_wishlist(self.user, non_existent_uuid)

    def test_move_wishlist_item_to_cart(self):
        """
        Test moving a wishlist item to the cart:
        - Adds a product to the wishlist and then moves it to the cart.
        - Verifies the item is removed from the wishlist & added to the cart.
        """
        add_product_to_wishlist(self.user, self.product.uuid)
        move_wishlist_item_to_cart(self.user, self.product.uuid)
        self.assertTrue(CartItem.objects.filter(
            cart__user=self.user,
            product=self.product).exists()
                        )
        wishlist = get_or_create_wishlist(self.user)
        self.assertEqual(wishlist.items.count(), 0)


class UnauthorizedWishlistAccessTest(TestCase):
    """
    Test suite for ensuring unauthorized users
    cannot access wishlist functionality.
    """

    def setUp(self):
        """
        Set up API client, category, product for unauthorized access tests.
        """
        self.client = APIClient()
        self.category = Category.objects.create(
            name='Electronics',
            slug='electronics'
        )
        self.product = Product.objects.create(
            name='Test Product', price=100.0, stock=5,
            category=self.category
        )

    def test_unauthorized_access_to_wishlist(self):
        """
        Test that unauthorized users cannot retrieve a wishlist:
        - Expects a 401 Unauthorized response.
        """
        response = self.client.get(reverse('wishlist:wishlist-detail'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthorized_add_to_wishlist(self):
        """
        Test that unauthorized users cannot add a product to the wishlist:
        - Expects a 401 Unauthorized response.
        """
        response = self.client.post(
            reverse('wishlist:wishlist-add'),
            {'product_uuid': str(self.product.uuid)}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class WishlistNoStockTest(TestCase):
    """
    Test suite for adding items to the wishlist
    where stock status may affect eligibility.
    """

    def setUp(self):
        """
        Set up an API client, a user, category, and product for no-stock tests.
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
            name='Test Product',
            price=100.0, stock=5,
            category=self.category
        )

    def test_add_product_with_no_stock_to_wishlist(self):
        """
        Test adding a product with no stock to the wishlist:
        - Ensures that products can be added to the wishlist
        even if out of stock.
        """
        wishlist = add_product_to_wishlist(self.user, self.product.uuid)
        self.assertEqual(wishlist.items.count(), 1)
        self.assertEqual(wishlist.items.first().product, self.product)


class WishlistRemoveNonExistentItemTest(TestCase):
    """
    Test suite for appropriate handling when removing a non-existent item.
    """

    def setUp(self):
        """
        Set up user, category, product instance for non-existent item tests.
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
            name='Test Product',
            price=100.0, stock=5,
            category=self.category
        )

        add_product_to_wishlist(self.user, self.product.uuid)

    def test_remove_item_not_in_wishlist(self):
        """
        Test removal of an item not in the wishlist:
        - Attempts to remove a product that was never added,
        expecting a NotFound exception.
        """
        # Remove a product that has never been added
        another_product = Product.objects.create(
            name='Another Product', price=150.0, stock=10,
            category=self.category
        )
        with self.assertRaises(ProductNotInWishlistException):
            remove_product_from_wishlist(self.user, another_product.uuid)
