# checkout/tests/test_checkout_process.py

import threading
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
from django.core.exceptions import ValidationError


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

    @patch('payment.services.stripe.PaymentIntent.create')
    def test_checkout_already_paid_order(self, mock_payment_intent_create):
        self.client.force_authenticate(user=self.user)
        # Configure the mock to return a fake PaymentIntent
        mock_payment_intent_create.return_value = {
            'id': 'pi_test',
            'client_secret': 'test_client_secret'
        }

        # Endpoint for initiating the checkout process
        url = reverse('checkout:start-checkout')

        # Make a POST request to start checkout
        response = self.client.post(url, format='json', data={'shipping_address': '123 Main St'})

        # Assert that the response is successful
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Attempt to initiate checkout again for the same order
        response_duplicate = self.client.post(url, format='json', data={'shipping_address': '123 Main St'})

        # Assert that the response status is 400 BAD REQUEST
        self.assertEqual(response_duplicate.status_code, status.HTTP_400_BAD_REQUEST)

        # Assert that the error message indicates the payment already exists
        self.assertEqual(response_duplicate.data['detail'], "Checkout session already exists for this cart.")

    @patch('payment.services.stripe.PaymentIntent.create')
    def test_checkout_with_missing_shipping_address(self, mock_payment_intent_create):
        # Configure the mock to return a fake PaymentIntent
        mock_payment_intent_create.return_value = {
            'id': 'pi_test',
            'client_secret': 'test_client_secret'
        }

        # Endpoint for initiating the checkout process
        url = reverse('checkout:start-checkout')

        # Make a POST request without shipping_address
        response = self.client.post(url, format='json', data={})

        # Assert that the response status is 400 BAD REQUEST
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Assert that the error message indicates the shipping address is required
        self.assertIn('shipping_address', response.data['detail'])
        self.assertEqual(response.data['detail']['shipping_address'][0], 'This field is required.')

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

    @patch('payment.services.stripe.PaymentIntent.create')
    def test_checkout_requires_authentication(self, mock_payment_intent_create):
        # Configure the mock to return a fake PaymentIntent
        mock_payment_intent_create.return_value = {
            'id': 'pi_test',
            'client_secret': 'test_client_secret'
        }

        # Logout the user to simulate an unauthenticated request
        self.client.logout()

        # Endpoint for initiating the checkout process
        url = reverse('checkout:start-checkout')

        # Make a POST request to start checkout
        response = self.client.post(url, format='json', data={'shipping_address': '123 Main St'})

        # Assert that the response status is 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Optionally, assert the error message
        self.assertEqual(response.data['detail'], "Authentication credentials were not provided.")

    # @patch('payment.services.stripe.PaymentIntent.create')
    # def test_checkout_with_insufficient_stock(self, mock_payment_intent_create):
    #     # Configure the mock to return a fake PaymentIntent
    #     mock_payment_intent_create.return_value = {
    #         'id': 'pi_test',
    #         'client_secret': 'test_client_secret'
    #     }
    #
    #     # Set product stock to 1, less than the cart quantity of 2
    #     self.product.stock = 1
    #     self.product.save()
    #
    #     # Endpoint for initiating the checkout process
    #     url = reverse('checkout:start-checkout')
    #
    #     # Make a POST request to start checkout
    #     response = self.client.post(url, format='json', data={'shipping_address': '123 Main St'})
    #
    #     # Assert that the response status is 400 BAD REQUEST
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #
    #     # Assert that the error message indicates insufficient stock
    #     self.assertEqual(response.data['detail'], "Insufficient stock for product Test Product.")

    # def test_add_item_with_invalid_quantity(self):
    #     # Attempt to add a CartItem with quantity zero
    #     with self.assertRaises(ValidationError) as context:
    #         CartItem.objects.create(
    #             cart=self.cart,
    #             product=self.product,
    #             quantity=0
    #         )
    #
    #     # Assert that the ValidationError message is as expected
    #     self.assertIn('quantity', str(context.exception))
    #
    #     # Attempt to add a CartItem with negative quantity
    #     with self.assertRaises(ValidationError) as context_neg:
    #         CartItem.objects.create(
    #             cart=self.cart,
    #             product=self.product,
    #             quantity=-1
    #         )
    #
    #     # Assert that the ValidationError message is as expected
    #     self.assertIn('quantity', str(context_neg.exception))

    # def test_access_another_users_order(self):
    #     # Create another user and their cart
    #     other_user = get_user_model().objects.create_user(
    #         email="otheruser@example.com", password="password123"
    #     )
    #     other_cart = Cart.objects.create(user=other_user)
    #     other_cart_item = CartItem.objects.create(
    #         cart=other_cart, product=self.product, quantity=1
    #     )
    #
    #     # Initiate checkout for the other user's cart
    #     from payment.services import create_payment_intent
    #     from order.services import create_order
    #     order = create_order(user=other_user, items_data=[
    #         {'product': self.product.uuid, 'quantity': 1}
    #     ])
    #     create_payment_intent(order_id=order.id, user=other_user)
    #
    #     # Attempt to retrieve the other user's checkout session
    #     checkout_session = CheckoutSession.objects.get(order=order)
    #     url = reverse('checkout:complete-checkout', kwargs={'checkout_session_uuid': checkout_session.uuid})
    #
    #     # Authenticate as self.user and attempt to access
    #     self.client.force_authenticate(user=self.user)
    #     response = self.client.post(url, format='json', data={'payment_status': 'SUCCESS'})
    #
    #     # Assert that the response status is 404 NOT FOUND or 403 FORBIDDEN
    #     self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])
    #
    #     # Assert appropriate error message
    #     self.assertIn('detail', response.data)

    # @patch('payment.services.stripe.PaymentIntent.create')
    # def test_concurrent_checkout_attempts(self, mock_payment_intent_create):
    #     # Configure the mock to return a fake PaymentIntent
    #     mock_payment_intent_create.return_value = {
    #         'id': 'pi_test',
    #         'client_secret': 'test_client_secret'
    #     }
    #
    #     # Endpoint for initiating the checkout process
    #     url = reverse('checkout:start-checkout')
    #
    #     # Define a function to perform checkout
    #     def perform_checkout(results, index):
    #         response = self.client.post(url, format='json', data={'shipping_address': '123 Main St'})
    #         results[index] = response
    #
    #     # Prepare to store responses
    #     results = [None, None]
    #
    #     # Create two threads to simulate concurrent requests
    #     threads = [
    #         threading.Thread(target=perform_checkout, args=(results, 0)),
    #         threading.Thread(target=perform_checkout, args=(results, 1)),
    #     ]
    #
    #     # Start both threads
    #     for thread in threads:
    #         thread.start()
    #
    #     # Wait for both threads to finish
    #     for thread in threads:
    #         thread.join()
    #
    #     # Count successful and failed responses
    #     success_count = sum(1 for res in results if res.status_code == status.HTTP_201_CREATED)
    #     failure_count = sum(1 for res in results if res.status_code == status.HTTP_400_BAD_REQUEST)
    #
    #     # Assert that only one checkout succeeded
    #     self.assertEqual(success_count, 1)
    #     self.assertEqual(failure_count, 1)
    #
    #     # Assert that the failure response indicates the payment already exists
    #     for res in results:
    #         if res.status_code == status.HTTP_400_BAD_REQUEST:
    #             self.assertEqual(res.data['detail'], "Payment already exists for this order.")

    # @patch('payment.services.stripe.PaymentIntent.create')
    # def test_checkout_with_invalid_data_types(self, mock_payment_intent_create):
    #     # Configure the mock to return a fake PaymentIntent
    #     mock_payment_intent_create.return_value = {
    #         'id': 'pi_test',
    #         'client_secret': 'test_client_secret'
    #     }
    #
    #     # Endpoint for initiating the checkout process
    #     url = reverse('checkout:start-checkout')
    #
    #     # Make a POST request with invalid data types
    #     # For example, send an integer for 'shipping_address' instead of a string
    #     response = self.client.post(url, format='json', data={'shipping_address': 12345})
    #
    #     # Assert that the response status is 400 BAD REQUEST
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #
    #     # Assert that the error message indicates the shipping address type error
    #     self.assertIn('shipping_address', response.data)
    #     self.assertEqual(response.data['shipping_address'][0], 'Not a valid string.')
