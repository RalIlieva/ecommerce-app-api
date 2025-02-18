from unittest.mock import patch
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from products.models import Product, Category
from payment.models import Payment
from order.models import Order
from cart.models import Cart, CartItem
from checkout.models import CheckoutSession, ShippingAddress
from payment.services import create_payment_intent
import uuid


class CompleteCheckoutViewTestCase(APITestCase):
    """
    Test case for the Complete Checkout View.
    Simulates end-to-end scenarios to validate the payment
    and order completion processes.
    """

    @patch('payment.services.stripe.PaymentIntent.create')
    @patch('payment.services.create_payment_intent')
    def setUp(
            self, mock_create_payment_intent,
            mock_stripe_payment_intent_create
    ):
        """
        Set up the environment for each test.

        Mock the Stripe PaymentIntent.create and create_payment_intent calls
        to prevent actual API calls and ensure test reliability. This includes
        generating necessary objects for the cart, payment, order, and checkout
        sessions. The mocks are used to simulate payment intent creation.
        """
        # Mock the Stripe PaymentIntent.create call to prevent actual API calls
        mock_stripe_payment_intent_create.side_effect = \
            self.mocked_stripe_payment_intent_create

        # Generate a unique payment secret for every test
        # to avoid Stripe's IdempotencyError
        mock_create_payment_intent.side_effect = \
            lambda *args, **kwargs: f'test_payment_secret_{uuid.uuid4()}'

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

        # Create order and payment using mocked function
        from order.services import create_order
        self.order = create_order(user=self.user, items_data=[
            {'product': self.product.uuid, 'quantity': 2}
        ])

        # Use create_payment_intent to create a payment & attach to the order
        self.payment_secret = create_payment_intent(
            order_uuid=self.order.uuid, user=self.user
        )
        self.payment = Payment.objects.get(order=self.order)

        self.shipping_address = ShippingAddress.objects.create(
            user=self.user,
            full_name="Test Other User",
            address_line_1="Somewhere",
            address_line_2="Somewhere 2",
            city="Lala",
            postal_code="12345",
            country="CountryName",
            phone_number="+359883368888"
        )

        # Create a checkout session
        self.checkout_session = CheckoutSession.objects.create(
            user=self.user,
            cart=self.cart,
            shipping_address=self.shipping_address,
            payment=self.payment,
            status='IN_PROGRESS'
        )

    def mocked_stripe_payment_intent_create(self, *args, **kwargs):
        """
        Mock the Stripe PaymentIntent create function
        to avoid making real API calls.
        Returns a dictionary simulating
        a payment intent response from Stripe.
        """
        # Mock the PaymentIntent create function to avoid real API calls
        return {
            'id': f'pi_{uuid.uuid4()}',
            'client_secret': f'pi_{uuid.uuid4()}_secret_{uuid.uuid4()}'
        }

    @patch('payment.services.stripe.PaymentIntent.retrieve')
    def test_successful_payment_completion(self, mock_payment_intent_retrieve):
        """
        Test successful payment completion.
        Mock the PaymentIntent to simulate a successful payment, then verify
        that the checkout session, payment status, order are updated correctly.
        """
        # Mock Stripe PaymentIntent to return a successful payment
        mock_payment_intent_retrieve.return_value = {
            'id': f'pi_test_success_{uuid.uuid4()}',
            'status': 'succeeded'
        }

        # Endpoint for completing the checkout
        url = reverse(
            'checkout:complete-checkout',
            kwargs={'checkout_session_uuid': self.checkout_session.uuid}
        )

        # Make a POST request to complete checkout
        response = self.client.post(url, format='json')

        # Assert that the response is successful
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )
        self.assertEqual(
            response.data['detail'],
            "Checkout completed successfully."
        )
        self.assertEqual(
            response.data['order_id'], self.order.uuid
        )

        # Refresh from DB
        self.payment.refresh_from_db()
        self.checkout_session.refresh_from_db()

        # Assert that payment status is updated to SUCCESS
        self.assertEqual(self.payment.status, Payment.SUCCESS)

        # Assert that checkout session status is updated to COMPLETED
        self.assertEqual(self.checkout_session.status, 'COMPLETED')

    @patch('payment.services.stripe.PaymentIntent.retrieve')
    def test_payment_failure_during_completion(
            self, mock_payment_intent_retrieve
    ):
        """
        Test scenario when the payment fails during the completion process.
        Mock a payment intent with a failed status and verify that the checkout
        session and payment statuses are correctly updated to 'FAILED'.
        """
        # Mock Stripe PaymentIntent to simulate payment failure
        # Indicates payment failed or requires a new payment method
        mock_payment_intent_retrieve.return_value = {
            'id': f'pi_test_failure_{uuid.uuid4()}',
            'status': 'requires_payment_method'
        }

        # Endpoint for completing the checkout
        url = reverse(
            'checkout:complete-checkout',
            kwargs={'checkout_session_uuid': self.checkout_session.uuid}
        )

        # Make a POST request to complete checkout
        response = self.client.post(url, format='json')

        # Assert that the response indicates payment failure
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'],
            "Payment could not be processed"
        )

        # Refresh from DB
        self.payment.refresh_from_db()
        self.checkout_session.refresh_from_db()

        # Assert that payment status is updated to FAILED
        self.assertEqual(self.payment.status, Payment.FAILED)

        # Assert that checkout session status is updated to FAILED
        self.assertEqual(self.checkout_session.status, 'FAILED')

    @patch('payment.services.stripe.PaymentIntent.retrieve')
    def test_complete_checkout_requires_authentication(
            self, mock_payment_intent_retrieve
    ):
        """
        Test that authentication is required for completing the checkout.
        Simulate an unauthenticated request and verify that a 401
        Unauthorized response is returned.
        """
        # Mock Stripe PaymentIntent to simulate successful status
        mock_payment_intent_retrieve.return_value = {
            'id': f'pi_test_unauth_{uuid.uuid4()}',
            'status': 'succeeded'
        }

        # Logout the user to simulate an unauthenticated request
        self.client.logout()

        # Endpoint for completing the checkout
        url = reverse(
            'checkout:complete-checkout',
            kwargs={'checkout_session_uuid': self.checkout_session.uuid}
        )

        # Make a POST request to complete checkout
        response = self.client.post(url, format='json')

        # Assert that the response status is 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(
            response.data['detail'],
            "Authentication credentials were not provided."
        )

    @patch('payment.services.stripe.PaymentIntent.retrieve')
    def test_complete_checkout_with_missing_payment_status(
            self, mock_payment_intent_retrieve
    ):
        """
        Test scenario when the payment status is missing or incomplete.
        Mock a payment intent that requires further payment action, and verify
        that the correct error message is returned to indicate payment failure.
        """
        # Mock Stripe PaymentIntent to simulate successful status
        mock_payment_intent_retrieve.return_value = {
            'id': f'pi_test_missing_status_{uuid.uuid4()}',
            'status': 'requires_payment_method'
        }

        # Endpoint for completing the checkout
        url = reverse(
            'checkout:complete-checkout',
            kwargs={'checkout_session_uuid': self.checkout_session.uuid}
        )

        # Make a POST request without 'payment_status'
        response = self.client.post(url, format='json', data={})

        # Assert the response status is 400 due to missing payment status
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'],
            "Payment could not be processed"
        )

    @patch('payment.services.stripe.PaymentIntent.create')
    @patch('payment.services.stripe.PaymentIntent.retrieve')
    def test_order_creation_after_checkout(
            self, mock_payment_intent_retrieve,
            mock_payment_intent_create
    ):
        """
        Test order creation after successful checkout.
        Simulates the entire flow from creating a checkout session to
        completing the checkout, and verifies that the order is created
        successfully and its items are correctly associated.
        """
        # Configure the mocks to simulate payment creation and retrieval
        unique_id = uuid.uuid4()
        mock_payment_intent_create.return_value = {
            'id': f'pi_order_creation_{unique_id}',
            'client_secret': f'order_creation_secret_{unique_id}'
        }
        mock_payment_intent_retrieve.return_value = {
            'id': f'pi_order_creation_{unique_id}',
            'status': 'succeeded'
        }

        # Ensure the cart has items
        self.assertTrue(
            self.cart.items.exists(),
            "The cart should have items before starting checkout"
        )

        # Delete any pre-existing CheckoutSession and Orders for the user
        CheckoutSession.objects.filter(cart=self.cart).delete()
        # Delete any orders that might have been created in previous tests
        Order.objects.filter(
            user=self.user).delete()

        # Endpoint for initiating the checkout process
        start_checkout_url = reverse('checkout:start-checkout')

        # Add logging to track the request/response cycle for debugging
        print("Attempting to start checkout process...")

        # Make a POST request to initiate the checkout session
        start_response = self.client.post(
            start_checkout_url, format='json',
            data={'shipping_address': '321 Pine St'}
        )

        # Print response for debugging purposes if it fails
        if start_response.status_code != status.HTTP_201_CREATED:
            print("Failed to initiate checkout session.")
            print(f"Response status code: {start_response.status_code}")
            print(f"Response data: {start_response.data}")

        # Assert that the response for starting checkout is successful
        self.assertEqual(start_response.status_code, status.HTTP_201_CREATED)

        # Retrieve the CheckoutSession and complete the checkout
        checkout_session_uuid = start_response.data['uuid']
        complete_checkout_url = reverse(
            'checkout:complete-checkout',
            kwargs={'checkout_session_uuid': checkout_session_uuid}
        )
        complete_response = self.client.post(
            complete_checkout_url, format='json'
        )

        # Assert that the checkout completes successfully
        self.assertEqual(complete_response.status_code, status.HTTP_200_OK)

        # Verify only 1 Order object exists for the user & it's completed
        orders = Order.objects.filter(user=self.user)
        self.assertEqual(
            orders.count(), 1,
            "There should be exactly one order for the user."
        )
        order = orders.first()
        self.assertIsNotNone(order)
        self.assertEqual(order.status, 'paid')

        # Verify that OrderItems are correctly associated
        order_items = order.order_items.all()
        self.assertEqual(order_items.count(), 1)
        self.assertEqual(order_items[0].product, self.product)
        self.assertEqual(order_items[0].quantity, 2)
