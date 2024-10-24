from unittest.mock import patch
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from payment.models import Payment
from order.models import Order
from django.contrib.auth import get_user_model


class WebhookTestCase(APITestCase):
    """
    Test case for handling Stripe webhook events related to payments.
    """

    def setUp(self):
        """
        Sets up the necessary data for testing webhook events.
        Creates a user, authenticates them, and creates an order and payment.
        """
        # Create a test user
        self.user = get_user_model().objects.create_user(
            email="testuser@example.com",
            password="password123"
        )
        # Authenticate user
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # Create a test order
        self.order = Order.objects.create(user=self.user, status=Order.PENDING)

        # Create a payment associated with the order
        self.payment = Payment.objects.create(
            order=self.order,
            user=self.user,
            amount=100.00,
            status=Payment.PENDING,
            stripe_payment_intent_id='pi_123'
        )

    @patch('payment.services.stripe.Webhook.construct_event')
    def test_stripe_webhook_payment_succeeded(
            self, mock_webhook_construct_event
    ):
        """
        Test handling of a 'payment_intent.succeeded' event from Stripe webhook.

        Ensures that when a successful payment is received from the Stripe webhook,
        the associated payment's status in the database is updated to 'SUCCESS'.
        """
        # Mock the webhook event
        mock_webhook_construct_event.return_value = {
            'type': 'payment_intent.succeeded',
            'data': {
                'object': {
                    'id': 'pi_123'
                }
            }
        }

        url = reverse('payment:stripe-webhook')
        response = self.client.post(
            url, {}, format='json', HTTP_STRIPE_SIGNATURE='test_signature'
        )

        # The response should be HTTP 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Refresh payment from db & ensure the status changed to SUCCESS
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, Payment.SUCCESS)
