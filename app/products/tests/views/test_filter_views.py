"""
Test API views for products filter.
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from products.models import (
    Product,
    Review,
    Category
)
from products.filters import ProductFilter


class ProductFilterTest(TestCase):
    def setUp(self):
        # Create a user model instance
        self.user_model = get_user_model()

        # Create two users to use as foreign keys for the reviews
        self.user1 = self.user_model.objects.create_user(
            email="user1@example.com", password="password123"
        )
        self.user2 = self.user_model.objects.create_user(
            email="user2@example.com", password="password123"
        )
        self.category = Category.objects.create(
            name="Electronics",
            slug="electronics"
        )
        self.product1 = Product.objects.create(
            name="Test Product 1",
            description="A great product",
            price=100.00,
            category=self.category, stock=10, slug="test-product-1"
        )
        self.product2 = Product.objects.create(
            name="Test Product 2",
            description="Another great product",
            price=150.00,
            category=self.category, stock=5, slug="test-product-2"
        )
        # Assign ratings
        Review.objects.create(product=self.product1, user=self.user1, rating=3)
        Review.objects.create(product=self.product1, user=self.user2, rating=4)
        Review.objects.create(product=self.product2, user=self.user1, rating=5)
        Review.objects.create(product=self.product2, user=self.user2, rating=5)

    def test_filter_by_min_avg_rating(self):
        queryset = Product.objects.all()
        filter = ProductFilter({'min_avg_rating': 4.0}, queryset=queryset)
        self.assertEqual(filter.qs.count(), 1)
        self.assertEqual(filter.qs.first(), self.product2)

    def test_filter_by_max_avg_rating(self):
        queryset = Product.objects.all()
        filter = ProductFilter({'max_avg_rating': 4.0}, queryset=queryset)
        self.assertEqual(filter.qs.count(), 1)
        self.assertEqual(filter.qs.first(), self.product1)
