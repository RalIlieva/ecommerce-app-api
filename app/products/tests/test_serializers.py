"""
Test API product serializers.
"""

from django.test import TestCase
from products.serializers import ProductDetailSerializer
from products.models import Category, Tag, Product


class ProductSerializerTest(TestCase):
    """Test the product serialization is successful."""

    def setUp(self):
        # Set up initial data
        self.category = Category.objects.create(
            name="Electronics",
            slug="electronics"
        )

    def test_valid_product_serializer(self):
        data = {
            "name": "Product 2",
            "price": 10.00,
            "slug": "product-2",
            "tags": [{"name": "Tag1", "slug": "tag1"}],
            "category": {"name": "Electronics", "slug": "electronics"},
            "description": "Test description",
            "stock": 5
        }
        serializer = ProductDetailSerializer(data=data)
        if not serializer.is_valid():
            print("Serializer Errors:", serializer.errors)  # Print the errors for debugging
        self.assertTrue(serializer.is_valid(), "Serializer validation failed.")


# from django.test import TestCase
# from products.serializers import ProductDetailSerializer
# from products.models import Category, Tag, Product
# from products.services import create_product_with_related_data
#
#
# class ProductSerializerTest(TestCase):
#     """Test the product serialization is successful."""
#
#     # def setUp(self):
#     #     # Set up initial data
#     #     self.category = Category.objects.create(
#     #     name="Electronics",
#     #     slug="electronics"
#     #     )
#     def test_valid_product_serializer(self):
#         category = Category.objects.create(
#         name="Electronics",
#         slug="electronics"
#         )
#         # tag = Tag.objects.create(name="Tag1", slug="tag1")
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
#             print(serializer.errors)  # Print the errors for debugging
#         self.assertTrue(serializer.is_valid())
#         self.assertTrue(serializer.is_valid())

    # def test_create_product_with_existing_category(self):
    #     data = {
    #         "name": "Product 2",
    #         "price": 10.00,
    #         "slug": "product-2",
    #         "tags": [{"name": "Tag1", "slug": "tag1"}],
    #         "category": {"slug": "electronics"},
    #         "description": "Test description",
    #         "stock": 5
    #     }
    #     # Directly call the service function to create the product
    #     product = create_product_with_related_data(data)
    #     self.assertEqual(product.name, "Product 2")
    #     self.assertEqual(product.category.slug, "electronics")
