from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status


CHANGE_PASS_URL = reverse('users:change_password')


class ChangePasswordTestCase(APITestCase):
    def setUp(self):
        # Create a user
        self.user = get_user_model().objects.create_user(
            email='testuser@example.com',
            password='old_password'
        )
        # self.change_password_url = '/users/change-password/'

        self.client.login(
            email='testuser@example.com',
            password='old_password'
        )

    def test_change_password_success(self):
        # Authenticate the user
        self.client.login(
            email='testuser@example.com',
            password='old_password'
        )

        # Payload for password change
        data = {
            'old_password': 'old_password',
            'new_password': 'new_secure_password',
            'confirm_password': 'new_secure_password',
        }

        # Make the API request
        response = self.client.post(CHANGE_PASS_URL, data)

        # Assert the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Password changed successfully', response.data.get('message', ''))

        # Check if the password was updated
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('new_secure_password'))

    def test_change_password_mismatch(self):
        # # Authenticate the user
        # self.client.login(username='testuser', password='old_password')

        # Payload with mismatched passwords
        data = {
            'old_password': 'old_password',
            'new_password': 'new_secure_password',
            'confirm_password': 'different_password',
        }

        response = self.client.post(CHANGE_PASS_URL, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # self.assertIn('Passwords do not match', str(response.data))
        self.assertIn('New passwords do not match.', response.data['detail']['non_field_errors'][0])

    def test_change_password_incorrect_old_password(self):
        # Authenticate the user
        # self.client.login(username='testuser', password='old_password')

        # Payload with incorrect old password
        data = {
            'old_password': 'wrong_password',
            'new_password': 'new_secure_password',
            'confirm_password': 'new_secure_password',
        }

        response = self.client.post(CHANGE_PASS_URL, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Old password is incorrect', str(response.data))

    def test_change_password_unauthenticated(self):
        # Payload for password change without login
        self.client.force_authenticate(user=None)  # Log out the user
        data = {
            'old_password': 'old_password',
            'new_password': 'new_secure_password',
            'confirm_password': 'new_secure_password',
        }

        response = self.client.post(CHANGE_PASS_URL, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
