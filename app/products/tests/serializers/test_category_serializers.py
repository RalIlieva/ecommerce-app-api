"""
Test API product serializers.
"""

from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from products.serializers import (
    ProductDetailSerializer,
    CategorySerializer,
    TagSerializer,
    ProductImageSerializer
)
from products.models import (
    Category,
    Product,
    # Tag,
    # ProductImage
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
