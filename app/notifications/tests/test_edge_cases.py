# from django.test import TestCase
# from notifications.models import Notification
# from django.contrib.auth import get_user_model
#
# User = get_user_model()
#
# class NotificationEdgeCaseTests(TestCase):
#
#     def setUp(self):
#         self.user = User.objects.create_user(email='user@example.com', password='password123')
#         self.notification = Notification.objects.create(
#             user=self.user,
#             notification_type=Notification.EMAIL,
#             subject='Test Notification',
#             body='This is a test notification.',
#             status=True
#         )
#
#     def test_notification_for_deleted_user(self):
#         """Test to check if a notification can be accessed for a deleted user."""
#         self.user.delete()  # Delete the user
#         notification_count = Notification.objects.filter(user=self.user).count()
#         self.assertEqual(notification_count, 0)  # Notifications should be removed with the user
#
#     def test_multiple_notifications_for_user(self):
#         """Test creating multiple notifications for a single user."""
#         Notification.objects.create(
#             user=self.user,
#             notification_type=Notification.EMAIL,
#             subject='Another Notification',
#             body='Another notification body',
#             status=True
#         )
#         notifications = Notification.objects.filter(user=self.user)
#         self.assertEqual(len(notifications), 2)  # Ensure both notifications were created correctly
