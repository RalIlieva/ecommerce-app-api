from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from products.models import Product, Category
from order.models import Order, OrderItem
from payment.models import Payment


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

    # Test concurrent payment handling (simulate race condition)
    def test_create_concurrent_payments_for_same_order(self):
        """
        Test handling concurrent payment requests for the same order.

        Simulates two clients attempting to create payments for the same order
        at the same time and ensures that only one succeeds.
        """
        # Create two clients to simulate two users making requests concurrently
        client_a = APIClient()
        client_b = APIClient()
        client_a.force_authenticate(user=self.user)
        client_b.force_authenticate(user=self.user)

        url = reverse('payment:create-payment')
        data = {'order_uuid': self.order.uuid}

        # Simulate concurrent requests
        response_a = client_a.post(url, data, format='json')
        response_b = client_b.post(url, data, format='json')

        # Ensure only one payment is successful
        successful_response = (
            response_a if response_a.status_code == status.HTTP_201_CREATED
            else response_b
        )
        self.assertEqual(
            successful_response.status_code, status.HTTP_201_CREATED
        )

        # The other response is 400 Bad Request due to payment already existing
        failed_response = (
            response_a if response_a != successful_response
            else response_b)

        self.assertEqual(
            failed_response.status_code, status.HTTP_400_BAD_REQUEST
        )
        self.assertIn('error', failed_response.data)
        self.assertIn(
            'Payment already exists for this order',
            failed_response.data['error']
        )
