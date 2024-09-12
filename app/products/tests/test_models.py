"""
Test the product models.
"""

from django.test import TestCase
from products.models import Category, Product


class CategoryModelTest(TestCase):
    """Test for creating category model."""
    def test_create_category(self):
        category = Category.objects.create(
            name="Electronics",
            slug="electronics"
        )
        self.assertEqual(category.name, "Electronics")
        self.assertEqual(category.slug, "electronics")

    def test_category_str(self):
        """Test the string representation of the category."""
        category = Category.objects.create(
            name="Electronics",
            slug="electronics"
        )
        self.assertEqual(str(category), "Electronics")

    def test_category_with_parent(self):
        """Test creating a category with a parent."""
        parent_category = Category.objects.create(name="Parent", slug="parent")
        child_category = Category.objects.create(
            name="Child",
            slug="child",
            parent=parent_category
        )
        self.assertEqual(child_category.parent, parent_category)
        self.assertEqual(child_category.name, "Child")


class ProductModelTest(TestCase):
    """Test creating a product with an existing category."""
    def test_create_product(self):
        category = Category.objects.create(
            name="Electronics",
            slug="electronics"
        )
        product = Product.objects.create(
            name="Product 2",
            description="Test description",
            price=10.00,
            category=category,
            stock=5,
            slug="product-2"
        )
        self.assertEqual(product.name, "Product 2")
        self.assertEqual(product.price, 10.00)
        self.assertEqual(product.category.name, "Electronics")
