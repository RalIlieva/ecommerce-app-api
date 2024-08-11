"""
Tests for the API administrator for all CRUD on customer profiles.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework.test import APIClient
from rest_framework import status

# from users.models import CustomerProfile


URL_LIST_ALL_PROFILES = reverse(
    'administrators:administrators_customer_profile-list'
)


def detail_url(user_id):
    """Create and return a customer profile detail URL."""
    return reverse(
        'administrators:administrators_customer_profile-detail', args=[user_id]
    )


class AdministratorCustomerProfileViewSetTests(TestCase):
    """Tests for the AdministratorCustomerProfileViewSet."""

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

    def test_list_customer_profiles(self):
        """Test listing customer profiles."""
        res = self.client.get(URL_LIST_ALL_PROFILES)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Django Signals - automatic profiles for all users
        self.assertEqual(len(res.data), 2)

    def test_retrieve_customer_profile(self):
        """Test retrieving a single customer profile."""
        url = detail_url(self.user.id)
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['id'], self.user.customer_profile.id)
        self.assertEqual(res.data['address'], self.user.customer_profile.address)
        self.assertEqual(res.data['gender'], self.user.customer_profile.gender)
        # Nested user serializer - access via user
        self.assertEqual(res.data['user']['email'], self.user.email)
        self.assertEqual(res.data['user']['id'], self.user.id)

