# notifications/tests/test_notifications_model.py

from django.test import TestCase
from django.contrib.auth import get_user_model
from notifications.models import Notification

User = get_user_model()

class NotificationModelTest(TestCase):

    def setUp(self):
        # Set up a user for the tests
        self.user = User.objects.create_user(
            email="user@example.com",
            password="password123"
        )

    def test_notification_creation(self):
        # Create a notification manually
        notification = Notification.objects.create(
            user=self.user,
            notification_type=Notification.EMAIL,
            subject="Test Subject",
            body="This is a test notification",
            status=False  # Not sent initially
        )

        # Verify that notification object is created correctly
        self.assertEqual(notification.user, self.user)
        self.assertEqual(notification.subject, "Test Subject")
        self.assertEqual(notification.body, "This is a test notification")
        self.assertFalse(notification.status)  # Initially not sent
