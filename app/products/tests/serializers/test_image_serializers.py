"""
Test API image serializers.
"""

from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from products.serializers import (
    ProductImageSerializer
)
from products.models import (
    Category,
    Product,
)


class ProductImageSerializerTest(TestCase):
    """Test the product image serialization is successful."""

    def setUp(self):
        self.category = Category.objects.create(
            name="Electronics",
            slug="electronics"
        )
        self.product = Product.objects.create(
            name="Product 1",
            description="Test description",
            price=20.00,
            category=self.category,
            stock=10,
            slug="product-1"
        )
        self.image_file = SimpleUploadedFile(
            "test_image.jpg",
            b"file_content",
            content_type="image/jpeg"
        )
        # Create a valid image file using Pillow
        image = Image.new('RGB', (100, 100), color='red')
        image_io = BytesIO()
        image.save(image_io, format='JPEG')
        image_io.seek(0)

        self.image_file = SimpleUploadedFile(
            name='test_image.jpg',
            content=image_io.read(),
            content_type='image/jpeg'
        )

    def test_valid_product_image_serializer(self):
        """Test serialization with valid product image data."""
        data = {
            "product": self.product.id,
            "image": self.image_file,
            "alt_text": "Test image"
        }
        serializer = ProductImageSerializer(data=data)
        if not serializer.is_valid():
            print("Serializer Errors:", serializer.errors)
        self.assertTrue(
            serializer.is_valid(), "Serializer validation failed."
        )

    def test_missing_image(self):
        """Test missing image raises an error in serialization."""
        data = {
            "product": self.product.id,
            "alt_text": "Test image without file"
        }
        serializer = ProductImageSerializer(data=data)
        self.assertFalse(
            serializer.is_valid(),
            "Serializer validation should fail for missing image."
        )
        self.assertIn(
            "image",
            serializer.errors,
            "Expected 'image' field error in serializer errors."
        )
