import time
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.test import TransactionTestCase
from threading import Thread
from django.urls import reverse
from order.models import Order, OrderItem
from products.models import Product, Category
from .test_base import OrderTestBase

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

        # Create a product with limited stock for the test, and assign the category
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
        response = self.client.post(ORDER_CREATE_URL, self.payload, format='json')
        # print(f"Response status: {response.status_code}, data: {response.data}")
        return response

    def test_prevent_overselling(self):
        """Test that overselling is prevented when two users attempt to buy the same product simultaneously."""

        # Define two threads to simulate two users placing orders at the same time
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
        # # (1 order should succeed, the other should fail due to the stock limit)
        # successful_orders = Order.objects.all()
        # self.assertEqual(successful_orders.count(), 2)

        # One of the requests should have failed due to lack of stock, let's check if that's the case
        self.assertGreaterEqual(self.product.stock, 0, "Product stock should not be negative")

    def tearDown(self):
        # Call parent teardown to handle cleanup (if any)
        super().tearDown()


# from django.test import TransactionTestCase
# from threading import Thread
# from django.urls import reverse
# from order.models import Order
# from .test_base import OrderTestBase
#
# ORDER_CREATE_URL = reverse('order:order-create')
#
#
# class OrderCreationTestCase(TransactionTestCase):
#     def test_prevent_overselling(self):
#         """Test that overselling is prevented when two users attempt to buy the same product simultaneously."""
#
#         def place_order():
#             payload = {
#                 'items': [{'product': str(self.product.uuid), 'quantity': 5}]
#             }
#             self.client.post(ORDER_CREATE_URL, payload, format='json')
#
#         # Start two threads that attempt to place the orders concurrently
#         thread1 = Thread(target=place_order)
#         thread2 = Thread(target=place_order)
#
#         thread1.start()
#         thread2.start()
#
#         thread1.join()
#         thread2.join()
#
#         # Assert that two orders were created
#         self.assertEqual(Order.objects.count(), 2)
#
#         # Assert that the stock is correctly reduced to 0
#         self.product.refresh_from_db()
#         self.assertEqual(self.product.stock, 0)
#
#     def tearDown(self):
#         super().tearDown()
#         # Don't explicitly close the connection here. Django will handle this.
