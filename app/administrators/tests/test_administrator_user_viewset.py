"""
Tests for the API administrator for all CRUD on users.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework.test import APIClient
from rest_framework import status


URL_LIST_ALL_USERS = reverse('administrators:administrators_users-list')


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
        self.assertEqual(len(res.data), 2)
