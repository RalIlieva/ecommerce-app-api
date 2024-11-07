# notifications/tests/test_notifications_views.py

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from notifications.models import Notification

User = get_user_model()


class NotificationViewsTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="user@example.com",
            password="password123"
        )
        self.client.force_authenticate(user=self.user)

        # Create some notifications for the user
        self.notification1 = Notification.objects.create(
            user=self.user,
            notification_type=Notification.EMAIL,
            subject="Test Subject 1",
            body="This is a test notification 1",
            status=True
        )
        self.notification2 = Notification.objects.create(
            user=self.user,
            notification_type=Notification.EMAIL,
            subject="Test Subject 2",
            body="This is a test notification 2",
            status=False
        )

    def test_list_notifications(self):
        response = self.client.get(reverse('notifications:notification-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

    def test_retrieve_notification(self):
        response = self.client.get(
            reverse(
                'notifications:notification-detail',
                args=[self.notification1.uuid]
            )
        )
        self.assertEqual(
            response.status_code, status.HTTP_200_OK
        )
        self.assertEqual(
            response.data['subject'], "Test Subject 1"
        )
        self.assertEqual(
            response.data['body'],
            "This is a test notification 1"
        )


class AdditionalNotificationViewsTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='user@example.com',
            password='password123'
        )
        self.admin_user = User.objects.create_superuser(
            email='admin@example.com',
            password='adminpassword'
        )
        self.client.force_authenticate(user=self.user)
        self.notification = Notification.objects.create(
            user=self.user,
            notification_type=Notification.EMAIL,
            subject='Test Notification',
            body='This is a test notification.',
            status=True
        )

    def test_unauthenticated_access(self):
        """Test that unauthenticated users cannot access notifications."""
        self.client.logout()
        url = reverse('notifications:notification-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_access_to_notifications(self):
        """Test that admin users can access notifications for any user."""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('notifications:notification-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
