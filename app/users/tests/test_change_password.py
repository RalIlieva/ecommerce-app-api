from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken


CHANGE_PASS_URL = reverse('users:change_password')


class ChangePasswordTestCase(APITestCase):
    """
    Test cases for the Change Password functionality of the API.
    """

    def setUp(self):
        """
        Set up a test user and log in to the test client.
        This user will be used across all test cases in this class.
        """
        # Create a user
        self.user = get_user_model().objects.create_user(
            email='testuser@example.com',
            password='old_password'
        )

        self.client.login(
            email='testuser@example.com',
            password='old_password'
        )

    def test_change_password_success(self):
        """
        Test the password change process for a logged-in user.
        Ensure the password is updated successfully and the correct
        response message is returned.
        """
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
        self.assertIn(
            'Password changed successfully',
            response.data.get('message', '')
        )

        # Check if the password was updated
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('new_secure_password'))

    def test_change_password_mismatch(self):
        """
        Test the password change process when the new password
        and confirmation password do not match.
        Ensure the request fails with a 400 status code and the correct
        error message is returned.
        """
        # Payload with mismatched passwords
        data = {
            'old_password': 'old_password',
            'new_password': 'new_secure_password',
            'confirm_password': 'different_password',
        }

        response = self.client.post(CHANGE_PASS_URL, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('New passwords do not match.', str(response.data))
        # self.assertIn(
        # 'New passwords do not match.',
        # response.data['detail']['non_field_errors'][0]
        # )

    def test_change_password_incorrect_old_password(self):
        """
        Test the password change process when the old password
        provided is incorrect.
        Ensure the request fails with a 400 status code and the correct
        error message is returned.
        """
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
        """
        Test the password change process when the user is not authenticated.
        Ensure the request fails with a 401 status code.
        """
        # Log out the user
        self.client.force_authenticate(user=None)
        data = {
            'old_password': 'old_password',
            'new_password': 'new_secure_password',
            'confirm_password': 'new_secure_password',
        }

        response = self.client.post(CHANGE_PASS_URL, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ChangePasswordForbiddenTest(APITestCase):
    def setUp(self):
        self.User = get_user_model()

        # Create two users
        self.user1 = self.User.objects.create_user(
            email='user1@example.com', password='password123', name='User One'
        )
        self.user2 = self.User.objects.create_user(
            email='user2@example.com', password='password123', name='User Two'
        )

        # Get tokens for user1 and user2
        self.user1_token = str(RefreshToken.for_user(self.user1).access_token)
        self.user2_token = str(RefreshToken.for_user(self.user2).access_token)

    def test_change_password_forbidden_for_other_users(self):
        """Test that a user cannot change another user's password."""
        # Log in as user1 and attempt to change user2's password
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {self.user1_token}'
        )

        payload = {
            'old_password': 'password123',  # User1's old password
            'new_password': 'newpassword456',
            'confirm_password': 'newpassword456',
            # Attempting to modify user2's password
            'user_id': str(self.user2.id),
        }

        response = self.client.post(CHANGE_PASS_URL, payload)

        # Ensure the response is 403 Forbidden
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('detail', response.data)
        self.assertEqual(
            response.data['detail'],
            'You do not have permission to perform this action.'
        )
