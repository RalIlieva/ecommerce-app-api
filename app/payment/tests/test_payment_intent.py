from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from products.models import Product, Category
from order.models import Order, OrderItem
from payment.models import Payment
from unittest.mock import patch


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

        # Create a product category
        self.category = Category.objects.create(
            name="Test Category"
        )

        # Create a product to be used in order items
        self.product = Product.objects.create(
            name="Test Product",
            price=50.00,
            stock=100,
            category=self.category
        )

        # Create a test order
        self.order = Order.objects.create(user=self.user, status=Order.PENDING)

        # Create order items to associate with the order
        self.order_item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=2,
            price=self.product.price
        )

    def tearDown(self):
        Payment.objects.all().delete()
        Order.objects.all().delete()
        get_user_model().objects.all().delete()

    @patch('payment.services.stripe.PaymentIntent.create')
    def test_create_payment_intent(self, mock_stripe_payment_intent):
        # Mock the response from Stripe PaymentIntent API
        mock_stripe_payment_intent.return_value = {
            'id': 'pi_123',
            'client_secret': 'test_secret'
        }

        # Define the URL for creating the payment intent
        url = reverse('payment:create-payment')
        data = {'order_id': self.order.id}

        # Debug: Print to verify the order and request data
        print(f"Order ID: {self.order.id}")
        print(f"Request Data: {data}")

        # Send POST request to create payment intent
        response = self.client.post(url, data, format='json')

        # Debug: Print response details for analysis
        print(f"Response Status Code: {response.status_code}")
        print(f"Response Data: {response.data}")

        # Ensure that the response status is 200 OK and contains the client secret
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('client_secret', response.data)

        # Check that the Payment object is created in the database
        payment = Payment.objects.get(order=self.order)
        self.assertEqual(payment.stripe_payment_intent_id, 'pi_123')
        self.assertEqual(payment.status, Payment.PENDING)

    def test_list_payments(self):
        # Debug: Check if there are any existing payments before the test
        print(f"Existing Payments Before Test: {Payment.objects.count()}")

        # Create different orders to test multiple payments
        order2 = Order.objects.create(user=self.user, status=Order.PENDING)

        # Create multiple payments for the user, each with a different order
        Payment.objects.create(order=self.order, user=self.user, amount=50.00, status=Payment.SUCCESS)
        Payment.objects.create(order=order2, user=self.user, amount=75.00, status=Payment.FAILED)

        url = reverse('payment:payment-list')
        response = self.client.get(url)

        # Access the 'results' key in response.data to get the actual list of payments
        payment_results = response.data['results']

        # Debug: Check the response data
        print(f"Response Data: {response.data}")

        # Debug: Print the actual response to understand the output
        print(f"Payment Results: {payment_results}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(payment_results), 2)

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

    def test_create_payment_with_invalid_order(self):
        url = reverse('payment:create-payment')
        data = {'order_id': 9999}  # Invalid order ID

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_create_duplicate_payment(self):
        # Create initial payment
        Payment.objects.create(order=self.order, user=self.user, amount=100.00, stripe_payment_intent_id='pi_123')

        # Attempt to create a second payment
        url = reverse('payment:create-payment')
        data = {'order_id': self.order.id}

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_unauthenticated_create_payment(self):
        self.client.logout()  # Make user unauthenticated

        url = reverse('payment:create-payment')
        data = {'order_id': self.order.id}

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
