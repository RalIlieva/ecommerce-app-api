# from django.test import TestCase
# from notifications.models import Notification
# from notifications.services import handle_order_creation_notification
# from django.contrib.auth import get_user_model
#
# User = get_user_model()
#
#
# class NotificationServiceTests(TestCase):
#
#     def setUp(self):
#         self.user = User.objects.create_user(
#             email='user@example.com',
#             password='password123'
#         )
#
#     def test_create_notification(self):
#         """
#         Test the service function that creates a notification for a user.
#         """
#         subject = "Order Confirmation"
#         body = "Your order has been confirmed!"
#
#         notification = handle_order_creation_notification(
#             user=self.user,
#             subject=subject,
#             body=body
#         )
#
#         self.assertIsInstance(notification, Notification)
#         self.assertEqual(notification.user, self.user)
#         self.assertEqual(notification.subject, subject)
#         self.assertEqual(notification.body, body)
#         self.assertFalse(notification.status)  # By default, status should be False (not sent)
