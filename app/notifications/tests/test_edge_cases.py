from django.test import TestCase
from notifications.models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()


class NotificationEdgeCaseTests(TestCase):

    def setUp(self):
        """
        Set up user and notification instance for edge case tests.
        """
        self.user = User.objects.create_user(
            email='user@example.com',
            password='password123'
        )
        # Create a notification for the user
        self.notification = Notification.objects.create(
            user=self.user,
            notification_type=Notification.EMAIL,
            subject='Test Notification',
            body='This is a test notification.',
            status=True
        )

    def test_notification_for_deleted_user(self):
        """
        Test to check if a notification can be accessed for a deleted user.
        """
        # Delete the user
        self.user.delete()

        # Refresh the queryset to confirm that no notifications exist for a deleted user
        notification_count = Notification.objects.filter(subject="Test Notification").count()

        # Since the user is deleted, no notification should exist
        self.assertEqual(notification_count, 0)

    def test_multiple_notifications_for_user(self):
        """Test creating multiple notifications for a single user."""
        Notification.objects.create(
            user=self.user,
            notification_type=Notification.EMAIL,
            subject='Another Notification',
            body='Another notification body',
            status=True
        )
        notifications = Notification.objects.filter(user=self.user)
        self.assertEqual(len(notifications), 2)  # Ensure both notifications were created correctly
