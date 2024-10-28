# checkout/tests/test_checkout_process.py

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


class CheckoutTestCase(APITestCase):

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
    def test_successful_checkout(self, mock_payment_intent_create):
        # Configure the mock to return a fake PaymentIntent
        mock_payment_intent_create.return_value = {
            'id': 'pi_test',
            'client_secret': 'test_client_secret'
        }

        # Endpoint for initiating the checkout process
        url = reverse('checkout:start-checkout')

        # Make a POST request to start checkout
        response = self.client.post(url, format='json', data={'shipping_address': '123 Main St'})

        # Debugging response if failure
        if response.status_code != status.HTTP_201_CREATED:
            print(f"Response Status Code: {response.status_code}")
            print(f"Response Data: {response.data}")

        # Check if response is successful
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify that the payment intent was created with the correct parameters
        order = Order.objects.get(user=self.user)
        mock_payment_intent_create.assert_called_once_with(
            amount=int(order.total_amount * 100),  # Amount in cents
            currency='usd',
            metadata={'order_id': order.id},
            payment_method_types=['card'],
            idempotency_key=f"order_{order.id}_payment"
        )

        # Verify that a Payment object was created
        payment = Payment.objects.filter(order=order).first()
        self.assertIsNotNone(payment)
        self.assertEqual(payment.stripe_payment_intent_id, "pi_test")
        self.assertEqual(payment.status, Payment.PENDING)
        self.assertEqual(payment.amount, 200.00)

        # Verify that the CheckoutSession is correctly associated with the Payment
        checkout_session = CheckoutSession.objects.get(user=self.user)
        self.assertEqual(checkout_session.payment, payment)
        self.assertEqual(checkout_session.status, 'IN_PROGRESS')

        # Verify that 'payment_secret' is included in the response
        self.assertIn('payment_secret', response.data)
        self.assertEqual(response.data['payment_secret'], 'test_client_secret')

    # @patch('payment.services.stripe.PaymentIntent.create')
    # def test_checkout_already_paid_order(self, mock_payment_intent_create):
    #     # Configure the mock to return a fake PaymentIntent
    #     mock_payment_intent_create.return_value = {
    #         'id': 'pi_test',
    #         'client_secret': 'test_client_secret'
    #     }
    #
    #     # Endpoint for initiating the checkout process
    #     url = reverse('checkout:start-checkout')
    #
    #     # Make a POST request to start checkout
    #     response = self.client.post(url, format='json', data={'shipping_address': '123 Main St'})
    #
    #     # Assert that the response is successful
    #     self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    #
    #     # Attempt to initiate checkout again for the same order
    #     response_duplicate = self.client.post(url, format='json', data={'shipping_address': '123 Main St'})
    #
    #     # Assert that the response status is 400 BAD REQUEST
    #     self.assertEqual(response_duplicate.status_code, status.HTTP_400_BAD_REQUEST)
    #
    #     # Assert that the error message indicates the payment already exists
    #     self.assertEqual(response_duplicate.data['detail'], "Payment already exists for this order.")

    # @patch('payment.services.stripe.PaymentIntent.create')
    # def test_checkout_with_missing_shipping_address(self, mock_payment_intent_create):
    #     # Configure the mock to return a fake PaymentIntent
    #     mock_payment_intent_create.return_value = {
    #         'id': 'pi_test',
    #         'client_secret': 'test_client_secret'
    #     }
    #
    #     # Endpoint for initiating the checkout process
    #     url = reverse('checkout:start-checkout')
    #
    #     # Make a POST request without shipping_address
    #     response = self.client.post(url, format='json', data={})
    #
    #     # Assert that the response status is 400 BAD REQUEST
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #
    #     # Assert that the error message indicates the shipping address is required
    #     self.assertIn('shipping_address', response.data)
    #     self.assertEqual(response.data['shipping_address'][0], 'This field is required.')

    @patch('payment.services.stripe.PaymentIntent.create')
    def test_payment_creation_stripe_error(self, mock_payment_intent_create):
        # Configure the mock to raise a StripeError
        mock_payment_intent_create.side_effect = StripeError("Stripe API error occurred.")

        # Endpoint for initiating the checkout process
        url = reverse('checkout:start-checkout')

        # Make a POST request to start checkout
        response = self.client.post(url, format='json', data={'shipping_address': '123 Main St'})

        # Assert that the response status is 400 BAD REQUEST
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Assert that the error message indicates a payment intent creation failure
        self.assertEqual(response.data['detail'],
                         "Failed to create payment intent: Stripe error: Stripe API error occurred.")

        # Verify that no Payment object was created
        orders = Order.objects.filter(user=self.user)
        for order in orders:
            payment_exists = Payment.objects.filter(order=order).exists()
            self.assertFalse(payment_exists)

    # @patch('payment.services.stripe.PaymentIntent.create')
    # def test_duplicate_checkout_attempts(self, mock_payment_intent_create):
    #     # Configure the mock to return a fake PaymentIntent
    #     mock_payment_intent_create.return_value = {
    #         'id': 'pi_test',
    #         'client_secret': 'test_client_secret'
    #     }
    #
    #     # Endpoint for initiating the checkout process
    #     url = reverse('checkout:start-checkout')
    #
    #     # First checkout attempt
    #     response_first = self.client.post(url, format='json', data={'shipping_address': '123 Main St'})
    #     self.assertEqual(response_first.status_code, status.HTTP_201_CREATED)
    #
    #     # Second checkout attempt with the same order
    #     response_second = self.client.post(url, format='json', data={'shipping_address': '123 Main St'})
    #
    #     # Assert that the second attempt fails due to existing payment
    #     self.assertEqual(response_second.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertEqual(response_second.data['detail'], "Payment already exists for this order.")
    #
    #     # Assert that PaymentIntent.create was called only once
    #     mock_payment_intent_create.assert_called_once()

    @patch('payment.services.stripe.PaymentIntent.create')
    def test_stock_updates_after_checkout(self, mock_payment_intent_create):
        # Configure the mock to return a fake PaymentIntent
        mock_payment_intent_create.return_value = {
            'id': 'pi_test',
            'client_secret': 'test_client_secret'
        }

        # Retrieve initial stock
        initial_stock = self.product.stock

        # Endpoint for initiating the checkout process
        url = reverse('checkout:start-checkout')

        # Make a POST request to start checkout
        response = self.client.post(url, format='json', data={'shipping_address': '123 Main St'})

        # Assert that the response is successful
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Refresh the product instance from the database
        self.product.refresh_from_db()

        # Calculate expected stock after purchase (quantity=2)
        expected_stock = initial_stock - 2

        # Assert that the stock has been updated correctly
        self.assertEqual(self.product.stock, expected_stock)