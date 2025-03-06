# vendor/tests/order/test_vendor_notifications.py

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.conf import settings
from products.models import Product, Category
from checkout.models import ShippingAddress
from order.services import create_order
from notifications.models import Notification


class VendorOrderNotificationTest(TestCase):
    def setUp(self):
        # Create a vendor user using the configured vendor email
        self.vendor_user = get_user_model().objects.create_user(
            email=settings.VENDOR_EMAIL, password='vendorpassword'
        )

        # Create a regular customer user
        self.user = get_user_model().objects.create_user(
            email='user@example.com', password='password123'
        )

        # Create a category and product
        self.category = Category.objects.create(
            name='Electronics', slug='electronics'
        )
        self.product = Product.objects.create(
            name='Test Product', description='A great product', price=100.00,
            category=self.category, stock=10, slug='test-product'
        )

        # Create a ShippingAddress instance
        self.shipping_address = ShippingAddress.objects.create(
            # Associate the shipping address with the current user
            user=self.user,
            full_name="Test User",
            address_line_1="789 Oak St",
            address_line_2="Apt 2",
            city="Test City",
            postal_code="12345",
            country="Test Country",
            phone_number="+359883368823"
        )

    def test_vendor_receives_notification_on_order_creation(self):
        # Create an order
        order = create_order(
            self.user, [{'product': self.product.uuid, 'quantity': 2}],
            shipping_address=self.shipping_address
        )

        # Check if the vendor received a notification
        vendor_notification = Notification.objects.filter(
            user=self.vendor_user, subject=f"New Order Received #{order.uuid}"
        ).first()

        self.assertIsNotNone(vendor_notification)
        self.assertEqual(
            vendor_notification.notification_type,
            Notification.EMAIL
        )
        self.assertIn(
            "A new order with ID",
            vendor_notification.body
        )
