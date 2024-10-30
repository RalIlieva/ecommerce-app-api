from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from products.models import Product, Category
from cart.models import Cart, CartItem


class CheckoutTestCase(APITestCase):
    """
    Test case for the checkout initiation process.
    This test suite verifies the behavior of the checkout process
    under different conditions, incl. attempts to initiate
    checkout with an empty cart.
    """

    def setUp(self):
        """
        Set up the environment for the checkout tests.
        Creates the necessary user, product, cart, cart items
        to be used in the test cases.
        """
        # Create test user
        self.user = get_user_model().objects.create_user(
            email="testuser@example.com", password="password123"
        )
        # Authenticate user
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # Create category and product for the order
        self.category = Category.objects.create(name="Test Category")
        self.product = Product.objects.create(
            name="Test Product", price=100.00, stock=10, category=self.category
        )

        # Create a cart and add items
        self.cart = Cart.objects.create(user=self.user)
        self.cart_item = CartItem.objects.create(
            cart=self.cart, product=self.product, quantity=2
        )

    def test_checkout_with_empty_cart(self):
        """
        Test attempting to initiate a checkout with an empty cart.
        This test verifies that an attempt to initiate the checkout process
        with an empty cart fails and returns a `400 BAD REQUEST` status.

        Steps:
            - Remove all items from the user's cart.
            - Make a POST request to initiate the checkout process.
            - Assert that the response indicates failure due to an empty cart.

        Expected Outcome:
            - The response status should be `400 BAD REQUEST`.
            - The response should contain an error message indicating
            the cart is empty.
        """
        # Ensure the cart is empty
        cart = Cart.objects.get(user=self.user)
        cart.items.all().delete()  # Remove all items from the cart

        # Endpoint for initiating the checkout process
        url = reverse('checkout:start-checkout')

        # Make a POST request to start checkout
        response = self.client.post(
            url, format='json',
            data={'shipping_address': '123 Main St'}
        )

        # Assert that the response status is 400 BAD REQUEST
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Assert that the error message is as expected
        self.assertEqual(response.data['detail'], "Cart is empty.")
