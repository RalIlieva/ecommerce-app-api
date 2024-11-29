"""
Tests for the API user who is customer and has a profile.
"""

import uuid
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework.test import APIClient
from rest_framework import status

from users.models import CustomerProfile

PROFILE_URL = reverse('users:customer_profile')
# PROFILE_UUID_URL = reverse('users:customer_profile_uuid', kwargs={'profile_uuid': 'some-uuid'})

# Generate a valid UUID for testing
valid_uuid = uuid.uuid4()
PROFILE_UUID_URL = reverse('users:customer_profile_uuid', kwargs={'profile_uuid': valid_uuid})

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
        self.assertEqual(res.data['user']['id'], self.user.id)
        self.assertEqual(res.data['user']['email'], self.user.email)
        self.assertEqual(res.data['user']['name'], self.user.name)

    def test_update_profile_success(self):
        """Test updating the profile for authenticated user."""
        payload = {
            'gender': 'm',
            'phone_number': '+359883388888',
            'address': '123 Test Street',
            'about': 'Testing'
        }

        res = self.client.patch(PROFILE_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Check that the response contains the updated data
        self.assertEqual(res.data['gender'], payload['gender'])
        self.assertEqual(res.data['phone_number'], payload['phone_number'])
        self.assertEqual(res.data['address'], payload['address'])
        self.assertEqual(res.data['about'], payload['about'])

        # Verify the profile has been updated in the database
        profile = CustomerProfile.objects.get(user=self.user)
        self.assertEqual(profile.gender, payload['gender'])
        self.assertEqual(profile.phone_number, payload['phone_number'])
        self.assertEqual(profile.address, payload['address'])
        self.assertEqual(profile.about, payload['about'])

    def test_create_profile_fails_for_unauthenticated(self):
        """Test that authentication is required for creating profile."""
        self.client.force_authenticate(user=None)
        res = self.client.get(PROFILE_URL)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_profile_unauthenticated(self):
        """Test that unauthenticated users cannot update their profile."""
        self.client.force_authenticate(user=None)  # Log out the user
        payload = {'address': 'New Address'}

        res = self.client.patch(PROFILE_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_profile_invalid_data(self):
        """Test that invalid profile data is rejected."""
        payload = {
            'phone_number': 'invalid_phone'  # Invalid phone number format
        }

        # Attempt to update the profile with invalid data
        res = self.client.patch(PROFILE_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        # Check that the error message is returned in the 'detail' field
        self.assertIn('phone_number', res.data['detail'])
        self.assertEqual(res.data['detail']['phone_number'][0], 'The phone number entered is not valid.')
        # self.assertIn('phone_number', res.data)

    def test_get_object_user_profile_not_found(self):
        """
        Test that UserProfileNotFoundException is raised if profile does not exist.
        """

        # Ensure that there is no CustomerProfile for the user
        if CustomerProfile.objects.filter(user=self.user).exists():
            CustomerProfile.objects.filter(user=self.user).delete()

        # Make a GET request to retrieve the profile
        res = self.client.get(PROFILE_UUID_URL)

        # Check that the status code is 400 Bad Request
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        # Check that the error message matches the expected detail
        self.assertEqual(res.data['detail'], "Customer profile not found.")


class AutomaticCustomerProfileCreationTest(TestCase):
    """Test that a CustomerProfile is created automatically with a new User."""

    def test_customer_profile_created(self):
        """Test that creating a user also creates a CustomerProfile."""
        user = create_user(
            email='profiletest@example.com',
            password='testpass123',
            name='Profile Tester'
        )
        profile_exists = CustomerProfile.objects.filter(user=user).exists()
        self.assertTrue(profile_exists)

    def test_customer_profile_attributes(self):
        """Test that the CustomerProfile has default attributes."""
        user = create_user(
            email='profileattr@example.com',
            password='testpass123',
            name='Profile Attr'
        )
        profile = CustomerProfile.objects.get(user=user)
        self.assertEqual(profile.gender, '')
        self.assertEqual(profile.phone_number, '')
        self.assertIsNone(profile.date_of_birth)
        self.assertIsNone(profile.about)
