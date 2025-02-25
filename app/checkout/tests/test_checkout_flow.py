from unittest.mock import patch
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from products.models import Product, Category
from payment.models import Payment
from cart.models import Cart, CartItem
from checkout.models import CheckoutSession, ShippingAddress
import uuid


class CompleteCheckoutFlowTestCase(APITestCase):
    """
    Test case for the complete checkout flow.
    This test suite verifies the behavior of the complete checkout process,
    including initiating checkout, completing checkout, payment verification,
    and stock update.
    """

    def setUp(self):
        """
        Set up the environment for the complete checkout flow tests.
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
        self.category = Category.objects.create(name="Electronics")
        self.product = Product.objects.create(
            name="Laptop", price=1000.00, stock=5, category=self.category
        )

        # Create a cart and add items
        self.cart = Cart.objects.create(user=self.user)
        self.cart_item = CartItem.objects.create(
            cart=self.cart, product=self.product, quantity=1
        )

    @patch('payment.services.stripe.PaymentIntent.create')
    @patch('payment.services.stripe.PaymentIntent.retrieve')
    def test_complete_checkout_flow(
            self, mock_payment_intent_retrieve,
            mock_payment_intent_create
    ):
        """
        Test the complete checkout flow,
        incl. initiating & completing checkout.
        Steps:
            - Mock PaymentIntent.create to simulate
            Stripe payment intent creation.
            - Mock PaymentIntent.retrieve to simulate
            a successful payment.
            - Initiate the checkout process via an API call.
            - Complete the checkout process via an API call.
            - Verify the checkout status, payment status, product stock update,
                and proper interaction with mocked services.

        Expected Outcomes:
            - The checkout initiation should be successful,
            returning a payment secret.
            - The checkout completion should be successful,
            returning an order ID.
            - The payment status should be updated to SUCCESS.
            - The checkout session status should be updated
            to COMPLETED.
            - The product stock decreases by the purchased quantity
            - Stripe's PaymentIntent.retrieve method should be called correctly
        """
        # Generate a UUID to use for the mocked order and payment
        order_uuid = uuid.uuid4()

        # Mock PaymentIntent.create to return a fake PaymentIntent
        mock_payment_intent_create.return_value = {
            'id': 'pi_complete_flow',
            'client_secret': 'complete_flow_secret',
            'metadata': {'order_uuid': str(order_uuid)}
        }

        # Mock PaymentIntent.retrieve to return a succeeded PaymentIntent
        mock_payment_intent_retrieve.return_value = {
            'id': 'pi_complete_flow',
            'status': 'succeeded',
            'metadata': {'order_uuid': str(order_uuid)}
        }

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

        # Step 1: Initiate Checkout
        start_checkout_url = reverse('checkout:start-checkout')
        start_response = self.client.post(
            start_checkout_url, format='json',
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
        print("Response Status Code:", start_response.status_code)
        print("Response Data:", start_response.data)

        self.assertEqual(start_response.status_code, status.HTTP_201_CREATED)
        self.assertIn('payment_secret', start_response.data)
        self.assertEqual(
            start_response.data['payment_secret'],
            'complete_flow_secret'
        )

        # Retrieve the CheckoutSession
        checkout_session_uuid = start_response.data['uuid']
        checkout_session = CheckoutSession.objects.get(
            uuid=checkout_session_uuid
        )

        # Step 2: Complete Checkout
        complete_checkout_url = reverse(
            'checkout:complete-checkout',
            kwargs={'checkout_session_uuid': checkout_session.uuid}
        )
        complete_response = self.client.post(
            complete_checkout_url, format='json',
            data={'payment_status': 'SUCCESS'}
        )

        self.assertEqual(
            complete_response.status_code,
            status.HTTP_200_OK
        )
        self.assertEqual(
            complete_response.data['detail'],
            "Checkout completed successfully."
        )
        self.assertEqual(
            complete_response.data['order_id'],
            checkout_session.payment.order.uuid
        )

        # Verify Payment status
        payment = Payment.objects.get(order=checkout_session.payment.order)
        self.assertEqual(payment.status, Payment.SUCCESS)

        # Verify CheckoutSession status
        checkout_session.refresh_from_db()
        self.assertEqual(checkout_session.status, 'COMPLETED')

        # Verify that the product stock is updated
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 4)  # Initially 5, purchased 1

        # Verify that Stripe PaymentIntent.retrieve was called correctly
        mock_payment_intent_retrieve.assert_called_once_with(
            'pi_complete_flow'
        )
