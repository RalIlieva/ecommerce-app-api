# """
# Test API product serializers.
# """
#
# from django.test import TestCase
# from products.serializers import ProductDetailSerializer
# from products.models import Category, Tag, Product
#
#
# class ProductSerializerTest(TestCase):
#     """Test the product serialization is successful."""
#     def test_valid_product_serializer(self):
#         category = Category.objects.create(name="Electronics", slug="electronics")
#         tag = Tag.objects.create(name="Tag1", slug="tag1")
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
