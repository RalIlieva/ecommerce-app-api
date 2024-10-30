from unittest.mock import patch
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from products.models import Product, Category
from payment.models import Payment
from cart.models import Cart, CartItem
from checkout.models import CheckoutSession


class CompleteCheckoutFlowTestCase(APITestCase):

    def setUp(self):
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
        # Mock PaymentIntent.create to return a fake PaymentIntent
        mock_payment_intent_create.return_value = {
            'id': 'pi_complete_flow',
            'client_secret': 'complete_flow_secret'
        }

        # Mock PaymentIntent.retrieve to return a succeeded PaymentIntent
        mock_payment_intent_retrieve.return_value = {
            'id': 'pi_complete_flow',
            'status': 'succeeded'
        }

        # Step 1: Initiate Checkout
        start_checkout_url = reverse('checkout:start-checkout')
        start_response = self.client.post(
            start_checkout_url, format='json',
            data={'shipping_address': '456 Elm St'}
        )

        self.assertEqual(start_response.status_code, status.HTTP_201_CREATED)
        self.assertIn('payment_secret', start_response.data)
        self.assertEqual(
            start_response.data['payment_secret'],
            'complete_flow_secret'
        )

        # Retrieve the CheckoutSession
        checkout_session_uuid = start_response.data['uuid']
        checkout_session = CheckoutSession.objects.get(uuid=checkout_session_uuid)

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
