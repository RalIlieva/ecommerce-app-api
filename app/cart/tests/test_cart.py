"""
Tests for Cart functionality.
"""

from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from products.models import Product, Category
from cart.models import Cart, CartItem
from django.urls import reverse
from uuid import uuid4


class CartTestCase(APITestCase):
    """
    Test case for cart-related operations, including
    adding, updating, removing, and retrieving cart items.
    """

    def setUp(self):
        """
        Set up a test user, authenticate them,
        and create a product and cart for testing.
        """
        # Create a test user
        self.user = get_user_model().objects.create_user(
            email="testuser@example.com",
            password="password123"
        )
        # Authenticate user
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # Create a product category
        self.category = Category.objects.create(name="Test Category")

        # Create a product to be used in the cart
        self.product = Product.objects.create(
            name="Test Product",
            price=50.00,
            stock=100,
            category=self.category
        )

        # Create a cart for the user
        self.cart = Cart.objects.create(user=self.user)

    def tearDown(self):
        """
        Clean up all created objects in the database after each test.
        """
        Cart.objects.all().delete()
        get_user_model().objects.all().delete()

    def test_create_cart_item(self):
        """
        Test adding a new item to the cart.
        Confirms successful creation with correct quantity.
        """
        url = reverse('cart:add-cart-item')
        data = {'product_uuid': self.product.uuid, 'quantity': 2}
        response = self.client.post(url, data, format='json')
        print(f"Create Cart Item Response Status Code: {response.status_code}")
        print(f"Create Cart Item Response Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CartItem.objects.count(), 1)
        self.assertEqual(CartItem.objects.first().quantity, 2)

    def test_update_cart_item(self):
        """
        Test updating the quantity of an existing cart item.
        Verifies that the quantity is updated as expected.
        """
        # Create a cart item for the existing cart
        cart_item = CartItem.objects.create(
            cart=self.cart, product=self.product, quantity=1
        )

        # Update the cart item quantity using its UUID
        url = reverse('cart:update-cart-item', kwargs={'uuid': cart_item.uuid})
        data = {'quantity': 5}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        cart_item.refresh_from_db()
        self.assertEqual(cart_item.quantity, 5)

    def test_remove_cart_item(self):
        """
        Test removing an item from the cart by its UUID.
        Checks that the item count in the cart decreases as expected.
        """
        # Create a cart item for the existing cart
        cart_item = CartItem.objects.create(
            cart=self.cart, product=self.product, quantity=1
        )

        # Remove the cart item using its UUID
        url = reverse('cart:remove-cart-item', kwargs={'uuid': cart_item.uuid})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CartItem.objects.count(), 0)

    def test_retrieve_cart_details(self):
        """
        Test retrieving cart details for the authenticated user.
        Verifies the response contains the correct cart items and quantities.
        """
        # Add items to the cart
        CartItem.objects.create(
            cart=self.cart, product=self.product, quantity=3
        )

        # Retrieve the cart details
        url = reverse('cart:cart-detail')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['quantity'], 3)

    def test_unauthorized_cart_access(self):
        """
        Test accessing the cart without authentication.
        Ensures an HTTP 401 Unauthorized status is returned.
        """
        # Log out the user to make them unauthenticated
        self.client.logout()
        url = reverse('cart:cart-detail')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_add_item_with_zero_quantity(self):
        """
        Test adding an item to the cart with zero quantity.
        Confirms a validation error response with HTTP 400 Bad Request.
        """
        url = reverse('cart:add-cart-item')
        data = {'product_uuid': self.product.uuid, 'quantity': 0}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "Quantity must be greater than zero.",
            response.data['detail']
        )

    def test_add_item_with_negative_quantity(self):
        """
        Test adding an item to the cart with a negative quantity.
        Confirms a validation error response with HTTP 400 Bad Request.
        """
        url = reverse('cart:add-cart-item')
        data = {'product_uuid': self.product.uuid, 'quantity': -1}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "Quantity must be greater than zero.",
            response.data['detail']
        )

    def test_add_item_exceeding_stock(self):
        """
        Test adding an item with a quantity exceeding available stock.
        Ensures that a validation error response is returned.
        """
        url = reverse('cart:add-cart-item')
        data = {'product_uuid': self.product.uuid, 'quantity': 101}  # Stock is 100
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "Not enough stock available for this product",
            str(response.data['detail'])
        )

    def test_add_duplicate_item_updates_quantity(self):
        """
        Test adding the same item twice to the cart.
        Confirms the item quantity is updated instead of creating a duplicate.
        """
        url = reverse('cart:add-cart-item')
        data = {'product_uuid': self.product.uuid, 'quantity': 2}

        # Add item to cart
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CartItem.objects.first().quantity, 2)

        # Add the same item again
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Quantity should be updated
        self.assertEqual(CartItem.objects.first().quantity, 4)

    def test_clear_cart(self):
        """
        Test clearing all items from the cart.
        Verifies that the cart item count becomes zero after clearing.
        """
        # Add items to the cart
        CartItem.objects.create(
            cart=self.cart, product=self.product, quantity=2
        )
        another_product = Product.objects.create(
            name="Another Product", price=20.00, stock=50,
            category=self.category
        )
        CartItem.objects.create(
            cart=self.cart, product=another_product, quantity=3
        )

        # Confirm items exist
        self.assertEqual(CartItem.objects.count(), 2)

        # Clear the cart
        url = reverse('cart:clear-cart')
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CartItem.objects.count(), 0)  # Cart should be empty

    def test_remove_non_existent_item(self):
        """
        Test removing a cart item that doesn't exist.
        Ensures a 404 Not Found response.
        """
        fake_uuid = uuid4()
        url = reverse('cart:remove-cart-item', kwargs={'uuid': fake_uuid})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Cart item not found.", response.data['detail'])

    def test_access_other_users_cart(self):
        """
        Test accessing or modifying another user's cart.
        Confirms that an unauthorized access attempt results in 404.
        """
        # Create a second user and their cart
        other_user = get_user_model().objects.create_user(
            email="otheruser@example.com", password="password123"
        )
        other_cart = Cart.objects.create(user=other_user)
        CartItem.objects.create(
            cart=other_cart, product=self.product, quantity=2
        )

        # Attempt to access other user's cart item
        cart_item_uuid = CartItem.objects.get(cart=other_cart).uuid
        url = reverse('cart:update-cart-item', kwargs={'uuid': cart_item_uuid})
        response = self.client.patch(url, {'quantity': 5}, format='json')
        # Should not allow access
        self.assertEqual(
            response.status_code, status.HTTP_404_NOT_FOUND
        )

    def test_product_removal_updates_cart(self):
        """
        Test the impact of product removal on the cart.
        Ensures that removing a product does not leave orphaned cart items.
        """
        # Create a cart item
        cart_item = CartItem.objects.create(
            cart=self.cart, product=self.product, quantity=2
        )
        # Delete the cart item before deleting the product
        cart_item.delete()
        # Now delete the product
        self.product.delete()
        # Cart item should be removed
        self.assertFalse(
            CartItem.objects.filter(id=cart_item.id).exists()
        )

    def test_set_excessive_quantity(self):
        """
        Test setting an excessive quantity for a cart item.
        Confirms that an appropriate validation error is returned.
        """
        # Create a cart item with quantity within stock
        cart_item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=1
        )

        # Attempt to set quantity too high
        url = reverse('cart:update-cart-item', kwargs={'uuid': cart_item.uuid})
        data = {'quantity': 1000}  # Exceeds typical stock limit
        response = self.client.patch(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "Quantity exceeds available stock.",
            response.data['detail']
        )

    def test_unauthorized_access_to_cart(self):
        """
        Test accessing cart details without being logged in.
        Ensures an HTTP 401 Unauthorized status response.
        """
        # Log out the user to make them unauthenticated
        self.client.logout()

        # Attempt to access the cart detail view
        url = reverse('cart:cart-detail')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_view_empty_cart(self):
        """
        Test retrieving an empty cart.
        Verifies that the response contains an empty list of items.
        """
        url = reverse('cart:cart-detail')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Cart items should be an empty list
        self.assertEqual(response.data['items'], [])
