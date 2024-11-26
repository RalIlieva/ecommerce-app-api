from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()


class PasswordResetTests(APITestCase):

    def setUp(self):
        # Create a user for testing
        self.user = User.objects.create_user(
            email='testuser@example.com',
            password='testpassword123'
        )
        # Construct the password reset URL dynamically
        self.password_reset_url = reverse('user-reset-password')
        # self.password_reset_url = '/api/v1/auth/users/reset_password/'

    def test_password_reset_request_successful(self):
        """
        Ensure we can send a password reset request for an existing user.
        """
        response = self.client.post(
            self.password_reset_url, {'email': self.user.email}
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_password_reset_request_invalid_email(self):
        """
        Ensure we get an appropriate response when an invalid email is used.
        """
        response = self.client.post(
            self.password_reset_url, {'email': 'nonexistent@example.com'}
        )
        # Done intentionally to avoid exposing information
        # for valid and invalid e-mails
        # Djoser best practices
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
