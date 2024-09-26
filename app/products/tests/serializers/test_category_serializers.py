"""
Test API product serializers.
"""

from django.test import TestCase
from products.serializers import (
    CategorySerializer
)


class CategorySerializerTest(TestCase):
    """Test the category serialization is successful."""

    def test_valid_category_serializer(self):
        """Test serialization with valid category data."""
        data = {
            "name": "Home Appliances",
            "slug": "home-appliances"
        }
        serializer = CategorySerializer(data=data)
        if not serializer.is_valid():
            print("Serializer Errors:", serializer.errors)
        self.assertTrue(
            serializer.is_valid(), "Serializer validation failed."
        )
