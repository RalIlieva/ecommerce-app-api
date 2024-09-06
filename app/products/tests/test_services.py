"""
Test for product services.
"""

from django.test import TestCase
# from products.models import Product, Category, Tag
from products.services import create_product_with_related_data


class ProductServiceTest(TestCase):
    """Test creating a product with related data."""
    def test_create_product_with_related_data(self):
        data = {
            "name": "Product 2",
            "price": 10.00,
            "slug": "product-2",
            "tags": [{"name": "Tag1", "slug": "tag1"}],
            "category": {"name": "Electronics", "slug": "electronics"},
            "description": "Test description",
            "stock": 5
        }
        product = create_product_with_related_data(data)
        self.assertEqual(product.name, "Product 2")
        self.assertEqual(product.category.name, "Electronics")
        self.assertEqual(product.tags.count(), 1)
