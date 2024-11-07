# notifications/tests/test_notifications_signals.py

from django.test import TestCase
from django.contrib.auth import get_user_model
from order.models import Order
from notifications.models import Notification
from unittest.mock import patch

User = get_user_model()


class NotificationSignalTest(TestCase):

    def setUp(self):
        # Set up a user and other necessary test data
        self.user = User.objects.create_user(
            email="user@example.com",
            password="password123"
        )

    @patch('notifications.tasks.send_order_confirmation_email.delay')
    def test_notification_created_on_order_creation(
            self, mock_send_email_task
    ):
        # Create an order to trigger the signal
        order = Order.objects.create(user=self.user)

        # Check that a notification has been created
        notification = Notification.objects.filter(
            user=self.user,
            subject=f"Order Confirmation #{order.uuid}"
        ).first()
        self.assertIsNotNone(notification)
        self.assertEqual(
            notification.subject, f"Order Confirmation #{order.uuid}"
        )

        # Ensure the Celery task was called
        mock_send_email_task.assert_called_once_with(notification.uuid)
