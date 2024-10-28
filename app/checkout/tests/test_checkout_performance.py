import time
from unittest.mock import patch
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from products.models import Product, Category
from payment.models import Payment
from order.models import Order
from cart.models import Cart, CartItem
from checkout.models import CheckoutSession
from stripe.error import StripeError


class CheckoutPerformanceTestCase(APITestCase):
    def setUp(self):
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

        # Make a POST request to start checkout
        response = self.client.post(url, format='json', data={'shipping_address': '789 Oak St'})

        # End timing
        end_time = time.time()
        elapsed_time = end_time - start_time

        # Assert that the response is successful
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Assert that the response time is within acceptable limits (e.g., < 2 seconds)
        self.assertLess(elapsed_time, 2, f"Checkout initiation took too long: {elapsed_time} seconds")
