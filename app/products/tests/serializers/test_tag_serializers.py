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


class TagSerializerTest(TestCase):
    """Test the tag serialization is successful."""

    def test_valid_tag_serializer(self):
        """Test serialization with valid tag data."""
        data = {
            "name": "Summer Sale",
            "slug": "summer-sale"
        }
        serializer = TagSerializer(data=data)
        if not serializer.is_valid():
            print("Serializer Errors:", serializer.errors)
        self.assertTrue(
            serializer.is_valid(), "Serializer validation failed."
        )
