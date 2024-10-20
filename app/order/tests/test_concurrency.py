import time
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.test import TransactionTestCase
from threading import Thread
from django.urls import reverse
from order.models import Order
from products.models import Product, Category

# URL for order creation
ORDER_CREATE_URL = reverse('order:order-create')


class OrderCreationTestCase(TransactionTestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            email='user@example.com', password='password123'
        )
        self.client.force_authenticate(self.user)

        # Create a category for the product (assuming the category is required)
        self.category = Category.objects.create(
            name="Test Category",
            slug="test-category"
        )

        # Create a product with limited stock
        self.product = Product.objects.create(
            # uuid="123e4567-e89b-12d3-a456-426614174000",  # example UUID
            name="Test Product",
            stock=10,  # Limited stock for concurrency test
            price=100.00,
            category=self.category  # Add the category here
        )

        # Short delay to ensure the product is available in the DB
        time.sleep(1)

        # Example payload for placing an order
        self.payload = {
            'items': [{'product': str(self.product.uuid), 'quantity': 5}]
        }

    def place_order(self):
        """Simulate placing an order by a user."""
        response = self.client.post(
            ORDER_CREATE_URL, self.payload, format='json'
        )
        # print(
        # f"Response status: {response.status_code}, data: {response.data}"
        # )
        return response

    def test_prevent_overselling(self):
        """
        Test overselling is prevented when 2 users attempt
        to buy the same product simultaneously.
        """

        # 2 threads to simulate 2 users placing orders simultaneously
        thread1 = Thread(target=self.place_order)
        thread2 = Thread(target=self.place_order)

        # Start both threads
        thread1.start()
        thread2.start()

        # Wait for both threads to complete
        thread1.join()
        thread2.join()

        # Refresh product from DB to get the latest stock data
        self.product.refresh_from_db()

        # Assert that two orders were created
        order_count = Order.objects.count()
        # print(f"Order count: {order_count}")
        self.assertEqual(order_count, 2)

        # Assert that the stock was correctly reduced to 0
        self.assertEqual(self.product.stock, 0)

        # # Assert that one of the requests failed due to insufficient stock
        # successful_orders = Order.objects.all()
        # self.assertEqual(successful_orders.count(), 2)

        # One of the requests should have failed due to lack of stock
        self.assertGreaterEqual(
            self.product.stock, 0, "Product stock should not be negative"
        )

    def tearDown(self):
        # Call parent teardown to handle cleanup
        super().tearDown()
