"""
Test for Django admin modifications.
"""

from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse


def create_user(**params):
    """Helper function."""
    return get_user_model().objects.create_user(**params)


class AdminSiteTests(TestCase):
    """Tests for Django Admin"""

    def setUp(self):
        """Create superuser and client."""
        self.client = Client()
        self.admin_user = get_user_model().objects.create_superuser(
            email='admin@example.com',
            password='testpass123',
        )
        self.client.force_login(self.admin_user)
        self.user = get_user_model().objects.create_user(
            email='user@example.com',
            password='testpass123',
            name='Test User',
        )

    def test_users_list(self):
        """Test that users are listed on the page."""
        url = reverse('admin:users_user_changelist')
        res = self.client.get(url)

        self.assertContains(res, self.user.name)
        self.assertContains(res, self.user.email)

    def test_edit_user_page(self):
        """Test the edit user page works."""
        url = reverse('admin:users_user_change', args=[self.user.id])
        res = self.client.get(url)

        self.assertEqual(res.status_code, 200)

    def test_create_user_page(self):
        """Test the create user page works."""
        url = reverse('admin:users_user_add')
        res = self.client.get(url)

        self.assertEqual(res.status_code, 200)


class SuperuserPermissionTest(TestCase):
    """Test permissions for superusers in the Django admin."""

    def setUp(self):
        self.client = Client()
        self.admin_user = get_user_model().objects.create_superuser(
            email='admin2@example.com',
            password='adminpass123'
        )
        self.client.force_login(self.admin_user)
        self.user = create_user(
            email='regularuser@example.com',
            password='testpass123',
            name='Regular User'
        )

    def test_superuser_can_access_admin(self):
        """Test that a superuser can access the admin site."""
        url = reverse('admin:index')
        res = self.client.get(url)
        self.assertEqual(res.status_code, 200)

    def test_superuser_can_add_user(self):
        """Test that a superuser can add a new user via admin."""
        url = reverse('admin:users_user_add')
        data = {
            'email': 'newadmin@example.com',
            'password1': 'newadminpass123',
            'password2': 'newadminpass123',
            'name': 'New Admin',
            'is_staff': True,
            'is_superuser': True,
        }
        res = self.client.post(url, data)
        # Redirect after successful creation
        self.assertEqual(res.status_code, 302)
        new_user = get_user_model().objects.get(email='newadmin@example.com')
        self.assertTrue(new_user.is_superuser)
        self.assertTrue(new_user.is_staff)
