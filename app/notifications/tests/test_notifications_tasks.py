from unittest.mock import patch
from django.test import TestCase
from django.contrib.auth import get_user_model
from notifications.models import Notification
from notifications.tasks import send_order_confirmation_email
from django.core import mail


User = get_user_model()


class NotificationTaskTest(TestCase):

    def setUp(self):
        # Set up a user for the test
        self.user = User.objects.create_user(
            email="user@example.com",
            password="password123"
        )
        # Create a notification
        self.notification = Notification.objects.create(
            user=self.user,
            notification_type=Notification.EMAIL,
            subject="Test Subject",
            body="This is a test notification",
            status=False
        )

    def test_send_email_task(self):
        # Run the Celery task
        send_order_confirmation_email(self.notification.uuid)

        # Check that an email was sent
        self.assertEqual(len(mail.outbox), 1)
        sent_email = mail.outbox[0]
        self.assertEqual(sent_email.subject, "Test Subject")
        self.assertEqual(sent_email.body, "This is a test notification")
        self.assertEqual(sent_email.to, [self.user.email])

        # Verify that notification status has been updated to True
        self.notification.refresh_from_db()
        self.assertTrue(self.notification.status)

    @patch(
        'notifications.tasks.send_mail',
        side_effect=Exception('SMTP server error')
    )
    def test_send_email_failure(self, mock_send_mail):
        """
        Test email sending failure to ensure it's handled properly.
        This test will patch the `send_mail` function to raise an exception.
        """
        # Call the send_order_confirmation_email task
        send_order_confirmation_email(self.notification.uuid)

        # Refresh the notification from the database to get the updated status
        self.notification.refresh_from_db()

        # Check that the notification status is still False
        # (email was not sent successfully)
        # Email sending failed, so the status should be False
        self.assertFalse(self.notification.status)
