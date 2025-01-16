from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status


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

    # def test_change_password_forbidden(self):
    #     # Create another user
    #     another_user = get_user_model().objects.create_user(
    #         email='anotheruser@example.com',
    #         password='another_password'
    #     )
    #
    #     # Authenticate as the first user
    #     self.client.force_authenticate(user=self.user)
    #
    #     # Attempt to change the password for another user
    #     # (violates IsOwner permission)
    #     data = {
    #         'old_password': 'old_password',  # Current user's password
    #         'new_password': 'new_secure_password',
    #         'confirm_password': 'new_secure_password',
    #     }
    #
    #     # Assuming the URL or logic explicitly includes the target user
    #     response = self.client.post(
    #         CHANGE_PASS_URL, data, **{'HTTP_TARGET_USER': another_user.id}
    #     )
    #
    #     # Check that the response returns 403 Forbidden
    #     self.assertEqual(
    #     response.status_code,
    #     status.HTTP_403_FORBIDDEN
    #     )
    #     self.assertIn(
    #     'You do not have permission to perform this action',
    #     str(response.data)
    #     )
