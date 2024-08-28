# """
# Test API views for products.
# """
#
# from django.contrib.auth import get_user_model
# from django.test import TestCase
# from django.urls import reverse
# from rest_framework import status
# from rest_framework.test import APIClient
# from products.models import Product
#
#
# class ProductViewTest(TestCase):
#     """Test product API views."""
#     def setUp(self):
#         self.client = APIClient()
#
#         self.admin_user = get_user_model().objects.create_superuser(
#             email='admin@example.com',
#             password='adminpass'
#         )
#         self.client.force_authenticate(user=self.admin_user)
#
#         # self.category = Category.objects.create(
#         # name="Electronics",
#         # slug="electronics"
#         # )
#         # self.tag = Tag.objects.create(name="Tag1", slug="tag1")
#         self.product_data = {
#             "name": "Product 2",
#             "price": 10.00,
#             "slug": "product-2",
#             "tags": [{"name": "Tag1", "slug": "tag1"}],
#             "category": {"name": "Electronics", "slug": "electronics"},
#             "description": "Test description",
#             "stock": 5
#         }
#
#     def test_create_product(self):
#         response = self.client.post(
#             reverse('product-create'),
#             self.product_data, format='json'
#         )
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         self.assertEqual(Product.objects.count(), 1)
#         self.assertEqual(Product.objects.get().name, "Product 2")
#
#     def test_create_product_with_existing_category(self):
#         new_product_data = self.product_data.copy()
#         new_product_data["name"] = "Product 3"
#         response = self.client.post(
#             reverse('product-create'),
#             new_product_data, format='json'
#         )
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         self.assertEqual(Product.objects.count(), 1)
#         self.assertEqual(Product.objects.get().name, "Product 3")
#         self.assertEqual(Product.objects.get().category.name, "Electronics")
