"""
Test users edge cases.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from ..models import CustomerProfile


def create_user(email='user@example.com', password='testpass123'):
    """Create and return a user"""
    return get_user_model().objects.create_user(email, password)


class UserDeletionTest(TestCase):
    """Test behavior when a User is deleted."""

    def setUp(self):
        self.user = create_user(
            email='deleteuser@example.com',
            password='testpass123',
        )

    def test_customer_profile_deleted_with_user(self):
        """Test that CustomerProfile is deleted when the User is deleted."""
        profile_uuid = self.user.customer_profile.uuid
        self.user.delete()
        profile_exists = CustomerProfile.objects.filter(uuid=profile_uuid).exists()
        self.assertFalse(profile_exists)

    def test_user_deleted_profile_no_error(self):
        """Ensure that deleting a user does not leave orphaned profiles."""
        self.user.delete()
        # Use user ID instead of the user instance
        with self.assertRaises(CustomerProfile.DoesNotExist):
            CustomerProfile.objects.get(user__id=self.user.id)
