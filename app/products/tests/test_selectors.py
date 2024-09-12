"""
Test for product selectors - fetching from db.
"""

from django.test import TestCase
from products.models import (
    Product,
    Category
)
from products.selectors import (
    get_product_by_id,
    search_products_by_name,
    get_active_products,
)


class ProductSelectorTest(TestCase):

    def setUp(self):
        """Create sample products for use in tests."""
        # Create a sample category
        self.category = Category.objects.create(
            name="Electronics", slug="electronics"
        )

        # Create products and assign the category
        self.product1 = Product.objects.create(
            name="Test Product 1",
            slug="test-product-1",
            price=50.00, is_active=True,
            stock=10,
            category=self.category
        )
        self.product2 = Product.objects.create(
            name="Sample Product",
            slug="test-product-2",
            price=100.00,
            is_active=False,
            stock=0,
            category=self.category
        )
        self.product3 = Product.objects.create(
            name="Another Test Product",
            slug="another-test-product",
            price=200.00,
            is_active=True,
            stock=20,
            category=self.category
        )

    def test_get_product_by_id(self):
        """Test retrieving a product by its ID."""
        # Test existing product
        product = get_product_by_id(self.product1.id)
        self.assertEqual(product, self.product1)

        # Test non-existing product
        product = get_product_by_id(999)  # ID does not exist
        self.assertIsNone(product)
