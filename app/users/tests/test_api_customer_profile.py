"""
Tests for the API user who is customer and has a profile.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework.test import APIClient
from rest_framework import status

from users.models import CustomerProfile

PROFILE_URL = reverse('users:customer_profile')

def create_user(**params):
    """Helper function."""
    return get_user_model().objects.create_user(**params)

class PrivateCustomerProfileApiTests(TestCase):
    """Test API requests that require authentication."""

    def setUp(self):
        self.user = create_user(
            email='test@example.com',
            password='testpass123',
            name='Test User'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # Ensure a CustomerProfile exists for this user before each test
        if not CustomerProfile.objects.filter(user=self.user).exists():
            CustomerProfile.objects.create(user=self.user)

    def test_retrieve_profile_success(self):
        """Test retrieving profile for logged in user."""
        res = self.client.get(PROFILE_URL)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # self.assertEqual(res.data['user'], self.user.id)
