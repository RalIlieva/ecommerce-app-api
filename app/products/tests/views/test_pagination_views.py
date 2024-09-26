"""
Test API views for products.
"""

from random import randint

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from products.models import (
    Product,
    Category,
    Tag,
    Review,
    ProductImage,
)


PRODUCTS_URL = reverse('products:product-list')
CREATE_PRODUCTS_URL = reverse('products:product-create')
CATEGORY_URL = reverse('products:category-list')
CREATE_CATEGORY_URL = reverse('products:category-create')
TAG_URL = reverse('products:tag-list')
TAG_CREATE_URL = reverse('products:tag-create')


def detail_url(product_uuid, slug):
    """
    Create and return a product detail URL with UUID and slug.
    """
    return reverse('products:product-detail', args=[product_uuid, slug])


def manage_url(product_uuid):
    """Manage - update, delete a product detail URL."""
    return reverse('products:product-manage', args=[product_uuid])


def image_upload_url(product_uuid, slug):
    """
    Create and return a product image upload URL with UUID and slug.
    """
    return reverse('products:product-image-upload', args=[product_uuid, slug])


def image_delete_url(product_uuid, slug, image_id):
    """
    Create and return a product image delete URL with UUID, slug, and image_id.
    """
    return reverse(
        'products:product-image-delete',
        args=[product_uuid, slug, image_id]
    )


def create_product(category=None, slug=None, **params):
    """Create and return a sample product."""
    if category is None:
        # Use get_or_create to avoid creating duplicate categories
        category, _ = Category.objects.get_or_create(
            name="General Category",
            slug="general-category"
        )

    if slug is None:
        # Generate a unique slug by appending a random number to the name
        slug = f"product-{randint(1000, 9999)}"

    defaults = {
            "name": "Product 2",
            "price": 10.00,
            "slug": slug,
            "category": category,
            "description": "Test description",
            "stock": 5
        }
    defaults.update(params)
    product = Product.objects.create(**defaults)
    return product


def create_admin_user(**params):
    """Create and return a new admin user."""
    return get_user_model().objects.create_superuser(**params)


def create_user(**params):
    """Create and return a new admin user."""
    return get_user_model().objects.create_user(**params)


class PaginationTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_pagination_is_applied(self):
        """Test that pagination is applied to the product list"""
        category = Category.objects.create(name="Category", slug="category")

        # Create 15 products
        for i in range(15):
            create_product(
                name=f'Product {i}',
                slug=f'product-{i}',
                category=category
            )

        res = self.client.get(PRODUCTS_URL)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Check if 10 products are returned by default
        self.assertEqual(len(res.data['results']), 10)
        self.assertIn('next', res.data['links'])
        self.assertIn('previous', res.data['links'])

    def test_custom_page_size(self):
        """Test that a custom page size can be applied"""
        category = Category.objects.create(name="Category", slug="category")

        # Create 15 products
        for i in range(15):
            create_product(
                name=f'Product {i}',
                slug=f'product-{i}',
                category=category
            )

        res = self.client.get(PRODUCTS_URL, {'page_size': 5})

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Check if 5 products are returned
        self.assertEqual(len(res.data['results']), 5)
        self.assertIn('next', res.data['links'])
        self.assertIn('previous', res.data['links'])
