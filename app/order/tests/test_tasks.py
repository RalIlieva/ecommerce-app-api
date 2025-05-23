from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from order.models import Order, OrderItem
from checkout.models import ShippingAddress
from products.models import Product, Category
from order.tasks import cancel_expired_orders_task

User = get_user_model()


class CancelExpiredOrdersTestCase(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            email='testuser@example.com', password='testpass'
        )

        # Create a test shipping address
        self.shipping_address = ShippingAddress.objects.create(
            user=self.user,
            full_name='Test User',
            address_line_1='123 Test Street',
            address_line_2='',
            city='Test City',
            postal_code='12345',
            country='Testland',
            phone_number='+1234567890'
        )

        self.category = Category.objects.create(
            name='Electronics',
            slug='electronics'
        )

        # Create a test product with initial stock of 10
        self.product = Product.objects.create(
            name='Test Product',
            slug='test-product',
            category=self.category,
            description='A great product',
            stock=10,
            price=100.00
        )

        # Create an expired order (created 2 hours ago) in PENDING status
        self.order = Order.objects.create(
            user=self.user,
            shipping_address=self.shipping_address,
            status=Order.PENDING
        )

        # Manually update the created timestamp
        self.order.created = timezone.now() - timedelta(hours=2)
        self.order.save(update_fields=["created"])

        # Add an order item with quantity 2 to the order
        self.order_item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=2,
            price=self.product.price
        )

    def test_cancel_expired_orders_task(self):
        # Verify initial conditions:
        self.assertEqual(self.order.status, Order.PENDING)
        self.assertEqual(self.product.stock, 10)

        # Run the Celery task manually
        cancel_expired_orders_task()

        # Refresh the objects from the database
        self.order.refresh_from_db()
        self.product.refresh_from_db()

        # Debugging output
        print(f"Order status after task: {self.order.status}")
        print(f"Product stock after task: {self.product.stock}")

        # After task execution, the order should be CANCELLED...
        self.assertEqual(self.order.status, Order.CANCELLED)
        # ... and the product stock should be increased by
        # the quantity from the order item (10 + 2 = 12)
        self.assertEqual(self.product.stock, 12)
