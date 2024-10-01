"""
Tests for the API administrator for all CRUD on users.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework.test import APIClient
from rest_framework import status


URL_LIST_ALL_USERS = reverse('administrators:administrators_users-list')


def detail_url(user_id):
    """Create and return a user detail URL."""
    return reverse(
        'administrators:administrators_users-detail', args=[user_id]
    )


class AdministratorUserViewSetTests(TestCase):
    """Tests for the AdministratorUserViewSet."""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = get_user_model().objects.create_superuser(
            email='admin@example.com',
            password='adminpass'
        )
        self.client.force_authenticate(user=self.admin_user)

        self.user = get_user_model().objects.create_user(
            email='user@example.com',
            password='userpass',
            name='Test User'
        )

    def test_list_users(self):
        """Test listing users."""
        res = self.client.get(URL_LIST_ALL_USERS)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 2)

    def test_retrieve_user(self):
        """Test retrieving a single user."""
        url = detail_url(self.user.uuid)
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], self.user.email)

    def test_update_user(self):
        """Test updating a user."""
        url = detail_url(self.user.uuid)
        payload = {'name': 'Updated Name'}
        res = self.client.patch(url, payload)

        self.user.refresh_from_db()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user.name, payload['name'])

    def test_delete_user(self):
        """Test deleting a user."""
        url = detail_url(self.user.uuid)
        res = self.client.delete(url)

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            get_user_model().objects.filter(id=self.user.id).exists()
        )

    def test_non_admin_user_cannot_access(self):
        """Test that non-admin users cannot access these endpoints."""
        non_admin = get_user_model().objects.create_user(
            email='nonadmin@example.com',
            password='userpass',
        )
        self.client.force_authenticate(user=non_admin)

        res = self.client.get(URL_LIST_ALL_USERS)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_non_admin_user_cannot_retrieve(self):
        """Test that non-admin users cannot retrieve other user detail."""
        non_admin = get_user_model().objects.create_user(
            email='nonadmin@example.com',
            password='userpass',
        )

        self.client.force_authenticate(user=non_admin)

        url = detail_url(self.user.id)
        res = self.client.delete(url)

        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
