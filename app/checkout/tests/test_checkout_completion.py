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


class CompleteCheckoutViewTestCase(APITestCase):
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

        # Create order and payment
        from order.services import create_order
        from payment.services import create_payment_intent
        self.order = create_order(user=self.user, items_data=[
            {'product': self.product.uuid, 'quantity': 2}
        ])
        self.payment_secret = create_payment_intent(order_id=self.order.id, user=self.user)
        self.payment = Payment.objects.get(order=self.order)

        # Create a checkout session
        self.checkout_session = CheckoutSession.objects.create(
            user=self.user,
            cart=self.cart,
            shipping_address='123 Main St',
            payment=self.payment,
            status='IN_PROGRESS'
        )

    # @patch('payment.services.stripe.PaymentIntent.retrieve')
    # def test_successful_payment_completion(self, mock_payment_intent_retrieve):
    #     # Configure the mock to return a completed PaymentIntent
    #     mock_payment_intent_retrieve.return_value = {
    #         'id': 'pi_test',
    #         'status': 'succeeded'
    #     }
    #
    #     # Endpoint for completing the checkout
    #     url = reverse('checkout:complete-checkout', kwargs={'checkout_session_uuid': self.checkout_session.uuid})
    #
    #     # Make a POST request to complete checkout with payment_status 'SUCCESS'
    #     response = self.client.post(url, format='json', data={'payment_status': 'SUCCESS'})
    #
    #     # Assert that the response is successful
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     self.assertEqual(response.data['detail'], "Checkout completed successfully.")
    #     self.assertEqual(response.data['order_id'], str(self.order.uuid))
    #
    #     # Refresh from DB
    #     self.payment.refresh_from_db()
    #     self.checkout_session.refresh_from_db()
    #
    #     # Assert that payment status is updated to SUCCESS
    #     self.assertEqual(self.payment.status, Payment.SUCCESS)
    #
    #     # Assert that checkout session status is updated to COMPLETED
    #     self.assertEqual(self.checkout_session.status, 'COMPLETED')

    # @patch('payment.services.stripe.PaymentIntent.retrieve')
    # def test_payment_failure_during_completion(self, mock_payment_intent_retrieve):
    #     # Configure the mock to return a failed PaymentIntent
    #     mock_payment_intent_retrieve.return_value = {
    #         'id': 'pi_test',
    #         'status': 'requires_payment_method'  # Indicates payment failed or requires a new payment method
    #     }
    #
    #     # Endpoint for completing the checkout
    #     url = reverse('checkout:complete-checkout', kwargs={'checkout_session_uuid': self.checkout_session.uuid})
    #
    #     # Make a POST request to complete checkout with payment_status 'FAILED'
    #     response = self.client.post(url, format='json', data={'payment_status': 'FAILED'})
    #
    #     # Assert that the response indicates payment failure
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertEqual(response.data['detail'], "Payment failed. Checkout could not be completed.")
    #
    #     # Refresh from DB
    #     self.payment.refresh_from_db()
    #     self.checkout_session.refresh_from_db()
    #
    #     # Assert that payment status is updated to FAILED
    #     self.assertEqual(self.payment.status, Payment.FAILED)
    #
    #     # Assert that checkout session status is updated to FAILED
    #     self.assertEqual(self.checkout_session.status, 'FAILED')

    # @patch('payment.services.stripe.PaymentIntent.retrieve')
    # def test_complete_checkout_requires_authentication(self, mock_payment_intent_retrieve):
    #     # Configure the mock to return a completed PaymentIntent
    #     mock_payment_intent_retrieve.return_value = {
    #         'id': 'pi_test',
    #         'status': 'succeeded'
    #     }
    #
    #     # Logout the user to simulate an unauthenticated request
    #     self.client.logout()
    #
    #     # Endpoint for completing the checkout
    #     url = reverse('checkout:complete-checkout', kwargs={'checkout_session_uuid': self.checkout_session.uuid})
    #
    #     # Make a POST request to complete checkout
    #     response = self.client.post(url, format='json', data={'payment_status': 'SUCCESS'})
    #
    #     # Assert that the response status is 401 UNAUTHORIZED
    #     self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    #     self.assertEqual(response.data['detail'], "Authentication credentials were not provided.")

    # @patch('payment.services.stripe.PaymentIntent.retrieve')
    # def test_complete_checkout_with_missing_payment_status(self, mock_payment_intent_retrieve):
    #     # Configure the mock to return a completed PaymentIntent
    #     mock_payment_intent_retrieve.return_value = {
    #         'id': 'pi_test',
    #         'status': 'succeeded'
    #     }
    #
    #     # Endpoint for completing the checkout
    #     url = reverse('checkout:complete-checkout', kwargs={'checkout_session_uuid': self.checkout_session.uuid})
    #
    #     # Make a POST request without 'payment_status'
    #     response = self.client.post(url, format='json', data={})
    #
    #     # Assert that the response status is 400 BAD REQUEST
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #
    #     # Assert that the error message indicates the missing 'payment_status'
    #     self.assertIn('payment_status', response.data)
    #     self.assertEqual(response.data['payment_status'][0], 'This field is required.')

    # @patch('payment.services.stripe.PaymentIntent.retrieve')
    # def test_payment_intent_retrieval(self, mock_payment_intent_retrieve):
    #     # Configure the mock to return a succeeded PaymentIntent
    #     mock_payment_intent_retrieve.return_value = {
    #         'id': 'pi_test',
    #         'status': 'succeeded'
    #     }
    #
    #     # Endpoint for completing the checkout
    #     url = reverse('checkout:complete-checkout', kwargs={'checkout_session_uuid': self.checkout_session.uuid})
    #
    #     # Make a POST request to complete checkout with payment_status 'SUCCESS'
    #     response = self.client.post(url, format='json', data={'payment_status': 'SUCCESS'})
    #
    #     # Assert that the response is successful
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     self.assertEqual(response.data['detail'], "Checkout completed successfully.")
    #     self.assertEqual(response.data['order_id'], str(self.order.uuid))
    #
    #     # Refresh from DB
    #     self.payment.refresh_from_db()
    #     self.checkout_session.refresh_from_db()
    #
    #     # Assert that payment status is updated to SUCCESS
    #     self.assertEqual(self.payment.status, Payment.SUCCESS)
    #
    #     # Assert that checkout session status is updated to COMPLETED
    #     self.assertEqual(self.checkout_session.status, 'COMPLETED')
    #
    #     # Assert that PaymentIntent.retrieve was called with correct PaymentIntent ID
    #     mock_payment_intent_retrieve.assert_called_once_with('pi_test')