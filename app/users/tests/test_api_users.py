"""
Tests for the API user.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework.test import APIClient, APITestCase
from rest_framework import status


CREATE_USER_URL = reverse('users:register')
ME_URL = reverse('users:me')


def create_user(**params):
    """Helper function - create and return a new user."""
    return get_user_model().objects.create_user(**params)


class PublicUserApiTests(TestCase):
    """Test the public features of the user API."""

    def setUp(self):
        self.client = APIClient()

    def test_create_user_successful(self):
        """Test creating a user is successful"""
        payload = {
            'email': 'test@example.com',
            'password': 'test_pass_123',
            'name': 'Tester',
        }
        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = get_user_model().objects.get(email=payload['email'])
        self.assertTrue(user.check_password(payload['password']))
        self.assertNotIn('password', res.data)

    def test_user_with_email_exists_error(self):
        """Test error returned f the user with email exists."""
        payload = {
            'email': 'test@example.com',
            'password': 'test_pass_123',
            'name': 'Tester',
        }
        create_user(**payload)
        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_too_short_error(self):
        """Test an error is returned if password less than 5 chars."""
        payload = {
            'email': 'test@example.com',
            'password': 'pw',
            'name': 'Test Name',
        }
        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        user_exists = get_user_model().objects.filter(
            email=payload['email']
        ).exists()
        self.assertFalse(user_exists)


class AuthenticationTests(APITestCase):
    """Test the simple jwt authentication."""

    def setUp(self):
        self.user = create_user(
            email='testuser@example.com',
            password='good_pass'
        )
        self.url_login = reverse('token_obtain_pair')
        self.url_refresh = reverse('token_refresh')

    def test_jwt_authentication(self):
        """Test obtaining token"""
        response = self.client.post(
            self.url_login,
            {'email': 'testuser@example.com', 'password': 'good_pass'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

        access_token = response.data['access']
        refresh_token = response.data['refresh']

        """ Test accessing a protected endpoint with token. """
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)
        response = self.client.get(ME_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        """ Test refreshing token. """
        response = self.client.post(
            self.url_refresh,
            {'refresh': refresh_token}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

        new_access_token = response.data['access']

        """ Test accessing a protected endpoint with new token. """
        self.client.credentials(
            HTTP_AUTHORIZATION='Bearer ' + new_access_token
        )
        response = self.client.get(ME_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_invalid_login(self):
        """Test invalid login."""
        response = self.client.post(
            self.url_login,
            {'email': 'testuser@example.com',
             'password': 'wrong_pass'
             }
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn('access', response.data)
        self.assertNotIn('refresh', response.data)


class PrivateUserApiTests(TestCase):
    """Test API that require authentication."""

    def setUp(self):
        self.user = create_user(
            email='test@example.com',
            password='test_pass_123',
            name='Tester',
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_retrieve_profile_success(self):
        """Test retrieving profile for logged in user."""
        res = self.client.get(ME_URL)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, {
            'id': self.user.id,
            'uuid': str(self.user.uuid),
            'name': self.user.name,
            'email': self.user.email,
        })

    def test_post_me_not_allowed(self):
        """Test POST is not allowed for ME endpoint."""
        res = self.client.post(ME_URL, {})
        self.assertEqual(res.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_update_user_profile(self):
        """Test updating the user profile for the authenticated user."""
        payload = {'name': 'Updated Name', 'password': 'newpass123'}
        res = self.client.patch(ME_URL, payload)

        self.user.refresh_from_db()
        self.assertEqual(self.user.name, payload['name'])
        self.assertTrue(self.user.check_password(payload['password']))
        self.assertEqual(res.status_code, status.HTTP_200_OK)


class UserUUIDImmutabilityTest(APITestCase):
    """Test that UUID cannot be modified via the API."""

    def setUp(self):
        self.user = create_user(
            email='immutable@example.com',
            password='testpass123',
            name='Immutable User',
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_uuid_cannot_be_updated(self):
        """Test that updating the UUID via API is not allowed."""
        payload = {'uuid': '12345678-1234-5678-1234-567812345678'}
        res = self.client.patch(ME_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Refresh from DB to ensure UUID hasn't changed
        self.user.refresh_from_db()
        self.assertNotEqual(str(self.user.uuid), payload['uuid'])
        self.assertEqual(str(self.user.uuid), res.data['uuid'])

