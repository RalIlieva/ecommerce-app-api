from django.test import TestCase
from notifications.models import Notification
from notifications.services import handle_order_creation_notification
from django.contrib.auth import get_user_model
from order.models import Order

User = get_user_model()


class NotificationServiceTests(TestCase):
    """Test cases for the notification service functions."""

    def setUp(self):
        """
        Set up user and order instance for notification service tests.
        Creates a test user and an associated order instance to use
        in testing the notification creation service.
        """
        self.user = User.objects.create_user(
            email='user@example.com',
            password='password123'
        )
        # Create an order instance to be passed to the notification service
        self.order = Order.objects.create(
            user=self.user,
            status=Order.PENDING
        )

    def test_create_notification(self):
        """
        Test the service function that creates a notification for a user.
        This test checks if the service creates a Notification object with
        the correct details when an order is created.
        """
        # Call the service function with the order instance
        handle_order_creation_notification(order=self.order)

        # Verify that a Notification object was created
        notification = Notification.objects.filter(user=self.user).first()
        self.assertIsNotNone(notification)

        # Validate the notification details
        self.assertEqual(
            notification.subject,
            f"Order Confirmation #{self.order.uuid}"
        )
        self.assertEqual(
            notification.body,
            f"Your order with ID #{self.order.uuid}\
             has been successfully placed!"
        )
        # Initially, the notification status should be False
        self.assertFalse(notification.status)
