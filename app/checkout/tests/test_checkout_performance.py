import time
from unittest.mock import patch
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from products.models import Product, Category
from cart.models import Cart, CartItem
from checkout.models import ShippingAddress


class CheckoutPerformanceTestCase(APITestCase):
    """
    Test case for evaluating the performance of
    the checkout initiation process.
    This suite measures the performance of the checkout initiation, ensuring
    that the response times are within acceptable limits even under simulated
    delays (e.g., network latency).
    """
    def setUp(self):
        """
        Set up the environment for the performance test.
        Creates the necessary user, product, cart, cart items
        to be used in the test case.
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

    @patch('payment.services.stripe.PaymentIntent.create')
    def test_checkout_initiation_performance(self, mock_payment_intent_create):
        """
        Test the performance of the checkout initiation.
        This test measures the time taken to initiate the checkout process,
        ensuring that it completes within an acceptable limit.
        Steps:
            - Mock the Stripe `PaymentIntent.create` method to introduce
            a delay to simulate network latency.
            - Initiate the checkout process and time the response.
            - Assert that the response is successful.
            - Assert that the response time is within acceptable limits
            (e.g., < 2 seconds).

        Expected Outcome:
            - The checkout initiation should be completed successfully.
            - The elapsed time should be less than the
            predefined acceptable limit.

        Notes:
            - Simulates a network delay of 0.5 seconds using `time.sleep()`.
            - This test ensures that the system remains performant even when
            facing external latency.
        """
        # Configure the mock to return a fake PaymentIntent with a delay
        def delayed_create(*args, **kwargs):
            time.sleep(0.5)  # Simulate network delay
            return {
                'id': 'pi_performance',
                'client_secret': 'performance_secret'
            }
        mock_payment_intent_create.side_effect = delayed_create

        # Endpoint for initiating the checkout process
        url = reverse('checkout:start-checkout')

        # Start timing
        start_time = time.time()

        # Create a ShippingAddress instance
        shipping_address = ShippingAddress.objects.create(
            user=self.user,
            full_name="Test User",
            address_line_1="789 Oak St",
            address_line_2="Apt 2",
            city="Test City",
            postal_code="12345",
            country="Test Country",
            phone_number="+359883368888"
        )

        # Make a POST request to start checkout
        response = self.client.post(
            url, format='json',
            # data={'shipping_address': str(shipping_address.id)}
            data={
                'new_shipping_address': {
                    'full_name': shipping_address.full_name,
                    'address_line_1': shipping_address.address_line_1,
                    'address_line_2': shipping_address.address_line_2,
                    'city': shipping_address.city,
                    'postal_code': shipping_address.postal_code,
                    'country': shipping_address.country,
                    'phone_number': str(shipping_address.phone_number)
                }
            }
        )

        # End timing
        end_time = time.time()
        elapsed_time = end_time - start_time

        # Assert that the response is successful
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Assert  the response time is within acceptable limits
        # (e.g., < 2 seconds)
        self.assertLess(
            elapsed_time, 2,
            f"Checkout initiation took too long: {elapsed_time} seconds"
        )
