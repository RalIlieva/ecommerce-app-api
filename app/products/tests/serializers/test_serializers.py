# """
# Test API product serializers.
# """
#
# from PIL import Image
# from io import BytesIO
# from django.core.files.uploadedfile import SimpleUploadedFile
# from django.test import TestCase
# from products.serializers import (
#     ProductDetailSerializer,
#     CategorySerializer,
#     TagSerializer,
#     ProductImageSerializer
# )
# from products.models import (
#     Category,
#     Product,
#     # Tag,
#     # ProductImage
# )
#
#
# class ProductSerializerTest(TestCase):
#     """Test the product serialization is successful."""
#
#     def setUp(self):
#         # Set up initial data
#         self.category = Category.objects.create(
#             name="Electronics",
#             slug="electronics"
#         )
#
#     def test_valid_product_serializer_existing_category(self):
#         """Test serialization with existing category (nested)."""
#         data = {
#             "name": "Product 2",
#             "price": 10.00,
#             "slug": "product-2",
#             "tags": [{"name": "Tag1", "slug": "tag1"}],
#             "category": {"name": "Electronics", "slug": "electronics"},
#             "description": "Test description",
#             "stock": 5
#         }
#         serializer = ProductDetailSerializer(data=data)
#         if not serializer.is_valid():
#             print("Serializer Errors:", serializer.errors)
#         self.assertTrue(
#             serializer.is_valid(), "Serializer validation failed."
#         )
#
#     def test_valid_product_serializer_new_category(self):
#         """Test serialization with new category (nested)."""
#         data = {
#             "name": "Product 3",
#             "price": 15.00,
#             "slug": "product-3",
#             "tags": [],
#             "category": {"name": "New Category", "slug": "new-category"},
#             "description": "New description",
#             "stock": 6
#         }
#         serializer = ProductDetailSerializer(data=data)
#         # Print the errors for debugging
#         if not serializer.is_valid():
#             print("Serializer Errors:", serializer.errors)
#         self.assertTrue(
#         serializer.is_valid(),
#         "Serializer validation failed."
#         )
#
#     def test_invalid_category(self):
#         """Test invalid category raises an error in serialization."""
#         data = {
#             "name": "Product 4",
#             "price": 15.00,
#             "slug": "product-4",
#             "tags": [],
#             "category": {},
#             "description": "Description",
#             "stock": 7
#         }
#         serializer = ProductDetailSerializer(data=data)
#         self.assertFalse(
#             serializer.is_valid(),
#             "Serializer validation should fail for empty category."
#         )
#         self.assertIn(
#             "category",
#             serializer.errors,
#             "Expected 'category' field error in serializer errors."
#         )
#
#     def test_duplicate_slug(self):
#         """Test creating a product with an existing slug raises an error."""
#         Product.objects.create(
#             name="Existing Product",
#             price=100.00,
#             slug="existing-slug",
#             category=self.category,
#             description="Existing product description",
#             stock=10
#         )
#         data = {
#             "name": "New Product",
#             "price": 120.00,
#             "slug": "existing-slug",
#             "tags": [],
#             "category": {"name": "Electronics", "slug": "electronics"},
#             "description": "
#             Description of a new product with duplicate slug.
#             ",
#             "stock": 5
#         }
#         serializer = ProductDetailSerializer(data=data)
#         self.assertFalse(
#             serializer.is_valid(),
#             "Serializer should fail due to duplicate slug."
#         )
#         self.assertIn(
#             "slug", serializer.errors,
#             "Expected 'slug' field error in serializer errors."
#         )
#
#
# class CategorySerializerTest(TestCase):
#     """Test the category serialization is successful."""
#
#     def test_valid_category_serializer(self):
#         """Test serialization with valid category data."""
#         data = {
#             "name": "Home Appliances",
#             "slug": "home-appliances"
#         }
#         serializer = CategorySerializer(data=data)
#         if not serializer.is_valid():
#             print("Serializer Errors:", serializer.errors)
#         self.assertTrue(
#             serializer.is_valid(), "Serializer validation failed."
#         )
#
#     # def test_duplicate_slug_category(self):
#     #     """
#     Test creating a category with an existing slug raises an error.
#     """
#     #     Category.objects.create(
#     #         name="Existing Category",
#     #         slug="existing-slug"
#     #     )
#     #     data = {
#     #         "name": "New Category",
#     #         "slug": "existing-slug"
#     #     }
#     #     serializer = CategorySerializer(data=data)
#     #     self.assertFalse(
#     #         serializer.is_valid(),
#     #         "Serializer should fail due to duplicate slug."
#     #     )
#     #     self.assertIn(
#     #         "slug", serializer.errors,
#     #         "Expected 'slug' field error in serializer errors."
#     #     )
#
#
# class TagSerializerTest(TestCase):
#     """Test the tag serialization is successful."""
#
#     def test_valid_tag_serializer(self):
#         """Test serialization with valid tag data."""
#         data = {
#             "name": "Summer Sale",
#             "slug": "summer-sale"
#         }
#         serializer = TagSerializer(data=data)
#         if not serializer.is_valid():
#             print("Serializer Errors:", serializer.errors)
#         self.assertTrue(
#             serializer.is_valid(), "Serializer validation failed."
#         )
#
#     # def test_duplicate_slug_tag(self):
#     #     """Test creating a tag with an existing slug raises an error."""
#     #     Tag.objects.create(
#     #         name="Existing Tag",
#     #         slug="existing-slug"
#     #     )
#     #     data = {
#     #         "name": "New Tag",
#     #         "slug": "existing-slug"
#     #     }
#     #     serializer = TagSerializer(data=data)
#     #     self.assertFalse(
#     #         serializer.is_valid(),
#     #         "Serializer should fail due to duplicate slug."
#     #     )
#     #     self.assertIn(
#     #         "slug", serializer.errors,
#     #         "Expected 'slug' field error in serializer errors."
#     #     )
#
#
# class ProductImageSerializerTest(TestCase):
#     """Test the product image serialization is successful."""
#
#     def setUp(self):
#         self.category = Category.objects.create(
#             name="Electronics",
#             slug="electronics"
#         )
#         self.product = Product.objects.create(
#             name="Product 1",
#             description="Test description",
#             price=20.00,
#             category=self.category,
#             stock=10,
#             slug="product-1"
#         )
#         self.image_file = SimpleUploadedFile(
#             "test_image.jpg",
#             b"file_content",
#             content_type="image/jpeg"
#         )
#         # Create a valid image file using Pillow
#         image = Image.new('RGB', (100, 100), color='red')
#         image_io = BytesIO()
#         image.save(image_io, format='JPEG')
#         image_io.seek(0)
#
#         self.image_file = SimpleUploadedFile(
#             name='test_image.jpg',
#             content=image_io.read(),
#             content_type='image/jpeg'
#         )
#
#     def test_valid_product_image_serializer(self):
#         """Test serialization with valid product image data."""
#         data = {
#             "product": self.product.id,
#             "image": self.image_file,
#             "alt_text": "Test image"
#         }
#         serializer = ProductImageSerializer(data=data)
#         if not serializer.is_valid():
#             print("Serializer Errors:", serializer.errors)
#         self.assertTrue(
#             serializer.is_valid(), "Serializer validation failed."
#         )
#
#     def test_missing_image(self):
#         """Test missing image raises an error in serialization."""
#         data = {
#             "product": self.product.id,
#             "alt_text": "Test image without file"
#         }
#         serializer = ProductImageSerializer(data=data)
#         self.assertFalse(
#             serializer.is_valid(),
#             "Serializer validation should fail for missing image."
#         )
#         self.assertIn(
#             "image",
#             serializer.errors,
#             "Expected 'image' field error in serializer errors."
#         )
