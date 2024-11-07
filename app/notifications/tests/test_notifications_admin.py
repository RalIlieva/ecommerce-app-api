from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from notifications.models import Notification

User = get_user_model()


class NotificationAdminTest(TestCase):
    """
    Test cases for the Notification model in the Django Admin interface.
    """

    def setUp(self):
        """
        Set up user and notification instance for admin tests.
        Creates an admin user and logs them in. It also creates a notification
        instance to verify its availability & access in the Django Admin panel.
        """
        self.user = User.objects.create_user(
            email='admin@example.com',
            password='password123',
            is_staff=True,
            is_superuser=True
        )
        self.client.force_login(self.user)
        self.notification = Notification.objects.create(
            user=self.user,
            notification_type=Notification.EMAIL,
            subject='Test Notification',
            body='This is a test notification.',
        )

    def test_notification_admin_page(self):
        """
        Test that notification is accessible in the admin panel.
        Verifies that the notification changelist page in the Django Admin
        interface is accessible and contains the expected notification.
        """
        url = reverse('admin:notifications_notification_changelist')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Notification')

    def test_notification_detail_admin_page(self):
        """
        Test that notification detail page is accessible in the admin panel.
        Verifies that a detailed view of a specific notification is accessible
        and displays the correct subject in the Django Admin interface.
        """
        url = reverse(
            'admin:notifications_notification_change',
            args=[self.notification.id]
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Notification')
