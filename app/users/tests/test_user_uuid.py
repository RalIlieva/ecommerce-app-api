"""
Test for the user model UUID.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model


def create_user(email='user@example.com', password='testpass123'):
    """Create and return a user"""
    return get_user_model().objects.create_user(email, password)


class UserUUIDTest(TestCase):
    """Test UUID uniqueness and integrity in the User model."""

    def test_uuid_unique(self):
        """Test that each user has a unique UUID."""
        user1 = create_user(email='user1@example.com', password='testpass123')
        user2 = create_user(email='user2@example.com', password='testpass123')
        self.assertNotEqual(user1.uuid, user2.uuid)

    def test_uuid_format(self):
        """Test that the UUID is in the correct format."""
        user = create_user(email='user3@example.com', password='testpass123')
        import re
        uuid_regex = re.compile(
            r'^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-'
            r'[89ab][a-f0-9]{3}-[a-f0-9]{12}\Z',
            re.I
        )
        self.assertTrue(uuid_regex.match(str(user.uuid)))
