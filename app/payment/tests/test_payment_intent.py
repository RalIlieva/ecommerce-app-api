import stripe
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from products.models import Product, Category
from order.models import Order, OrderItem
from payment.models import Payment
from unittest.mock import patch


class PaymentTestCase(APITestCase):
    """
    Test case for testing the payment-related functionality.
    """

    def setUp(self):
        """
        Sets up the necessary data for payment tests.
        Creates user, authenticates them, creates a product, order, order item.
        """
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
        """
        Cleans up by deleting any created objects after each test.
        """
        Payment.objects.all().delete()
        Order.objects.all().delete()
        get_user_model().objects.all().delete()

    @patch('payment.services.stripe.PaymentIntent.create')
    def test_create_payment_intent(self, mock_stripe_payment_intent):
        """
        Test creating a payment intent via Stripe.
        Mocks the Stripe API to test the successful creation of payment intent
        & checks a Payment object is created in the db with 'PENDING' status.
        """
        # Mock the response from Stripe PaymentIntent API
        mock_stripe_payment_intent.return_value = {
            'id': 'pi_123',
            'client_secret': 'test_secret'
        }

        # Define the URL for creating the payment intent
        url = reverse('payment:create-payment')
        data = {'order_uuid': self.order.uuid}

        # Send POST request to create payment intent
        response = self.client.post(url, data, format='json')

        # Ensure that the response status is 200 OK &
        # contains the client secret
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('client_secret', response.data)

        # Check that the Payment object is created in the database
        payment = Payment.objects.get(order=self.order)
        self.assertEqual(payment.stripe_payment_intent_id, 'pi_123')
        self.assertEqual(payment.status, Payment.PENDING)

    def test_list_payments(self):
        """
        Test listing all payments for a user.
        Ensures that multiple payments are correctly listed
        when requested by the user.
        """
        # Create different orders to test multiple payments
        order2 = Order.objects.create(user=self.user, status=Order.PENDING)

        # Create multiple payments for the user, each with a different order
        Payment.objects.create(
            order=self.order,
            user=self.user,
            amount=50.00,
            status=Payment.SUCCESS
        )
        Payment.objects.create(
            order=order2,
            user=self.user,
            amount=75.00,
            status=Payment.FAILED
        )

        url = reverse('payment:payment-list')
        response = self.client.get(url)

        # Access the 'results' key in response.data
        # to get the actual list of payments
        payment_results = response.data['results']

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(payment_results), 2)

    def test_retrieve_payment_details(self):
        """
        Test retrieving details of a specific payment.
        Ensures that the correct payment details are returned
        when a valid payment UUID is provided.
        """
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
        """
        Test creating a payment with an invalid order ID.
        Ensures that the API returns a 400 error
        when trying to create a payment for a non-existent order.
        """
        url = reverse('payment:create-payment')
        data = {'order_id': 9999}  # Invalid order ID

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_create_duplicate_payment(self):
        """
        Test creating a duplicate payment for the same order.
        Ensures that attempting to create a second payment for
        the same order results in a 400 Bad Request response.
        """
        # Create initial payment
        Payment.objects.create(
            order=self.order,
            user=self.user,
            amount=100.00,
            stripe_payment_intent_id='pi_123'
        )

        # Attempt to create a second payment
        url = reverse('payment:create-payment')
        data = {'order_id': self.order.id}

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_unauthenticated_create_payment(self):
        """
        Test creating a payment without authentication.
        Ensures unauthenticated user receives 401 Unauthorized response.
        """
        self.client.logout()  # Make user unauthenticated

        url = reverse('payment:create-payment')
        data = {'order_id': self.order.id}

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_payment_for_already_paid_order(self):
        """
        Test creating a payment for an already paid order.

        Ensures that the API returns 400 error when trying to create a payment
        for an order that has already been marked as 'PAID'.
        """
        # Mark the order as paid
        self.order.status = Order.PAID
        self.order.save()

        # Attempt to create a payment for an already paid order
        url = reverse('payment:create-payment')
        data = {'order_uuid': self.order.uuid}
        response = self.client.post(url, data, format='json')

        # Expect a 400 Bad Request since the order is already paid
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn(
            'This order is already paid',
            response.data['error']
        )

    def test_create_payment_with_missing_order_id(self):
        """
        Test creating a payment without providing an order ID.
        Ensures that the API returns a 400 error
        when the order ID is missing in the request.
        """
        # Attempt to create a payment without providing the order ID
        url = reverse('payment:create-payment')
        data = {}  # No order_id provided
        response = self.client.post(url, data, format='json')

        # The response should be 400 Bad Request since the order_id is required
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('Order does not exist', response.data['error'])

    @patch('payment.services.stripe.PaymentIntent.create')
    def test_create_payment_intent_stripe_error(
            self, mock_stripe_payment_intent
    ):
        """
        Test handling errors from the Stripe PaymentIntent API.

        Mocks a Stripe API error & ensures the API responds with 400 error
        and an appropriate error message.
        """
        mock_stripe_payment_intent.side_effect = stripe.error.StripeError(
            "Something went wrong"
        )
        url = reverse('payment:create-payment')
        data = {'order_uuid': self.order.uuid}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('Something went wrong', response.data['error'])

    # # Test concurrent payment handling (simulate race condition)
    # def test_create_concurrent_payments_for_same_order(self):
    #     """
    #     Test handling concurrent payment requests for the same order.
    #
    #     Simulates two clients attempting to create payments for the same order
    #     at the same time and ensures that only one succeeds.
    #     """
    #     # Create two clients to simulate two users making requests concurrently
    #     client_a = APIClient()
    #     client_b = APIClient()
    #     client_a.force_authenticate(user=self.user)
    #     client_b.force_authenticate(user=self.user)
    #
    #     url = reverse('payment:create-payment')
    #     data = {'order_id': self.order.id}
    #
    #     # Simulate concurrent requests
    #     response_a = client_a.post(url, data, format='json')
    #     response_b = client_b.post(url, data, format='json')
    #
    #     # Ensure only one payment is successful
    #     successful_response = (
    #         response_a if response_a.status_code == status.HTTP_201_CREATED
    #         else response_b
    #     )
    #     self.assertEqual(
    #         successful_response.status_code, status.HTTP_201_CREATED
    #     )
    #
    #     # The other response is 400 Bad Request due to payment already existing
    #     failed_response = (
    #         response_a if response_a != successful_response
    #         else response_b)
    #
    #     self.assertEqual(
    #         failed_response.status_code, status.HTTP_400_BAD_REQUEST
    #     )
    #     self.assertIn('error', failed_response.data)
    #     self.assertIn(
    #         'Payment already exists for this order',
    #         failed_response.data['error']
    #     )

    # Full end-to-end payment creation and retrieval test
    def test_full_payment_flow(self):
        """
        Test the full payment flow,
        from creating a payment to retrieving its details.
        Ensures that a payment is successfully created,
        and its details can be retrieved.
        """
        url = reverse('payment:create-payment')
        data = {'order_uuid': self.order.uuid}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        client_secret = response.data['client_secret']
        self.assertIsNotNone(client_secret)

        payment = Payment.objects.get(order=self.order)
        detail_url = reverse(
            'payment:payment-detail',
            kwargs={'uuid': payment.uuid}
        )
        response = self.client.get(detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['uuid'], str(payment.uuid))
        self.assertEqual(response.data['amount'], '100.00')

    # Unauthorized user access to payments
    def test_user_cannot_access_other_user_payment(self):
        """
        Test that a user cannot access another user's payment details.

        Ensures that attempting to access another user's payment results
        in a 404 Not Found response.
        """
        # Create another user and payment
        other_user = get_user_model().objects.create_user(
            email="otheruser@example.com",
            password="password123"
        )
        payment = Payment.objects.create(
            order=self.order,
            user=self.user,
            amount=100.00,
            status=Payment.PENDING
        )

        # Authenticate as another user and attempt to access the payment
        self.client.force_authenticate(user=other_user)
        url = reverse('payment:payment-detail', kwargs={'uuid': payment.uuid})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
