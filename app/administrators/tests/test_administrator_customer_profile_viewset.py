"""
Tests for the API administrator for all CRUD on customer profiles.
"""

from datetime import datetime
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework.test import APIClient
from rest_framework import status

from users.models import CustomerProfile
from users.serializers import CustomerProfileSerializer


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

        # Test also the serialization
        customer_profiles = CustomerProfile.objects.all()
        serializer = CustomerProfileSerializer(customer_profiles, many=True)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Django Signals - automatic profiles for all users
        self.assertEqual(len(res.data['results']), 2)
        self.assertEqual(res.data['results'], serializer.data)

    def test_retrieve_customer_profile(self):
        """Test retrieving a single customer profile."""

        url = detail_url(self.user.customer_profile.uuid)
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['id'], self.user.customer_profile.id)
        self.assertEqual(
            res.data['profile_uuid'],
            str(self.user.customer_profile.uuid)
        )
        self.assertEqual(
            res.data['address'],
            self.user.customer_profile.address
        )
        self.assertEqual(res.data['gender'], self.user.customer_profile.gender)
        # Nested user serializer - access via user
        self.assertEqual(res.data['user']['email'], self.user.email)
        self.assertEqual(res.data['user']['id'], self.user.id)

    def test_update_customer_profile(self):
        """Test updating a customer profile."""
        payload = {
            'address': '456 Main St',
            'gender': 'f',
            'phone_number': '+359883368888',
            'date_of_birth': '2000-11-27',
            'about': 'Testing'
        }
        url = detail_url(self.user.customer_profile.uuid)
        res = self.client.patch(url, payload)

        self.user.customer_profile.refresh_from_db()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(
            self.user.customer_profile.address, payload['address']
        )
        self.assertEqual(self.user.customer_profile.gender, payload['gender'])
        self.assertEqual(
            self.user.customer_profile.phone_number, payload['phone_number']
        )
        # Convert date_of_birth from payload to datetime.date for comparison
        expected_date_of_birth = datetime.strptime(
            payload['date_of_birth'], '%Y-%m-%d').date()
        self.assertEqual(
            self.user.customer_profile.date_of_birth,
            expected_date_of_birth
        )
        self.assertEqual(self.user.customer_profile.about, payload['about'])

    def test_delete_customer_profile(self):
        """Test deleting a customer profile."""
        url = detail_url(self.user.customer_profile.uuid)
        res = self.client.delete(url)

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            CustomerProfile.objects.
            filter(id=self.user.customer_profile.id).
            exists()
        )

    def test_non_admin_user_cannot_access(self):
        """Test that non-admin users cannot access these endpoints."""
        non_admin = get_user_model().objects.create_user(
            email='nonadmin@example.com',
            password='userpass',
        )
        self.client.force_authenticate(user=non_admin)

        res = self.client.get(URL_LIST_ALL_PROFILES)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
