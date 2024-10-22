from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from order.models import Order
from payment.models import Payment
from unittest.mock import patch
import uuid


class PaymentTestCase(APITestCase):

    def setUp(self):
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

    def tearDown(self):
        # Clean up after each test
        Payment.objects.all().delete()
        Order.objects.all().delete()
        get_user_model().objects.all().delete()

    @patch('payment.services.stripe.PaymentIntent.create')
    def test_create_payment_intent(self, mock_stripe_payment_intent):
        mock_stripe_payment_intent.return_value = {'id': 'pi_123', 'client_secret': 'test_secret'}

        url = reverse('payment:create-payment')
        data = {'order_id': self.order.id}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('client_secret', response.data)

        # Assert payment object was created in the database
        payment = Payment.objects.get(order=self.order)
        self.assertEqual(payment.stripe_payment_intent_id, 'pi_123')
        self.assertEqual(payment.status, Payment.PENDING)

    def test_retrieve_payment_details(self):
        payment = Payment.objects.create(
            order=self.order,
            user=self.user,
            amount=100.00,
            status=Payment.PENDING,
            stripe_payment_intent_id='pi_123'
        )

        url = reverse('payment:payment-detail', kwargs={'uuid': payment.uuid})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['uuid'], str(payment.uuid))
        self.assertEqual(response.data['amount'], '100.00')

    def test_list_payments(self):
        # Create multiple payments for the user
        Payment.objects.create(order=self.order, user=self.user, amount=50.00, status=Payment.SUCCESS)
        Payment.objects.create(order=self.order, user=self.user, amount=75.00, status=Payment.FAILED)

        url = reverse('payment:payment-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
