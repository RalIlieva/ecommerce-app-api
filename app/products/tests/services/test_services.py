"""
Test for product services.
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
# from products.models import Product, Category, Tag
from products.services import (
    create_product_with_related_data,
    update_product_with_related_data
)


# def manage_url(product_id):
#     """Manage - update, delete a product detail URL."""
#     return reverse('products:product-manage', args=[product_id])

def manage_url(product_uuid):
    """Manage - update, delete a product detail URL."""
    return reverse('products:product-manage', args=[product_uuid])


def create_admin_user(**params):
    """Create and return a new admin user."""
    return get_user_model().objects.create_superuser(**params)


def create_user(**params):
    """Create and return a new admin user."""
    return get_user_model().objects.create_user(**params)


class ProductServiceTest(TestCase):
    """Test creating a product with related data."""
    def setUp(self):
        self.client = APIClient()

        self.admin_user = get_user_model().objects.create_superuser(
            email='admin@example.com',
            password='adminpass'
        )
        self.client.force_authenticate(user=self.admin_user)

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

    def test_update_product_with_related_data_first(self):
        data = {
            "name": "Product 3",
            "price": 15.00,
            "slug": "product-3",
            "tags": [{"name": "Tag1", "slug": "tag1"}],
            "category": {"name": "Electronics", "slug": "electronics"},
            "description": "About description",
            "stock": 4
        }
        product = create_product_with_related_data(data)

        payload = {
            "name": "Updated Product 3",
            "price": 10.00,
            "slug": "updated-product-3",
            "tags": [
                {"name": "Tag1", "slug": "tag1"},
                {"name": "Tag2", "slug": "tag2"}
            ],
            "description": "Updated description",
        }
        # url = manage_url(product.id)
        url = manage_url(product.uuid)
        res = self.client.patch(url, payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        product.refresh_from_db()

        # # Debugging output to check tags
        # print("Product Tags after update:", product.tags.all())

        self.assertEqual(product.name, payload['name'])
        self.assertEqual(product.name, "Updated Product 3")
        self.assertEqual(product.category.name, "Electronics")
        self.assertEqual(product.tags.count(), 2)
        # Assert specific tags are present
        tags = product.tags.all()
        self.assertIn("Tag1", [tag.name for tag in tags])
        self.assertIn("Tag2", [tag.name for tag in tags])

    def test_update_product_with_related_data_second(self):
        # Step 1: Create initial product with category and tags
        initial_data = {
            "name": "Product 3",
            "price": 15.00,
            "slug": "product-3",
            "tags": [{"name": "Tag1", "slug": "tag1"}],
            "category": {"name": "Electronics", "slug": "electronics"},
            "description": "Initial description",
            "stock": 4
        }
        product = create_product_with_related_data(initial_data)

        # Assert that the product was created correctly
        self.assertEqual(product.name, "Product 3")
        self.assertEqual(product.price, 15.00)
        self.assertEqual(product.description, "Initial description")
        self.assertEqual(product.category.name, "Electronics")
        self.assertEqual(product.tags.count(), 1)
        self.assertIn("Tag1", [tag.name for tag in product.tags.all()])

        # Step 2: Update the product with new data, including additional tags
        update_data = {
            "name": "Updated Product 3",
            "price": 10.00,
            "slug": "updated-product-3",
            "tags": [
                {"name": "Tag1", "slug": "tag1"},
                {"name": "Tag2", "slug": "tag2"}
            ],
            "description": "Updated description",
        }
        updated_product = update_product_with_related_data(
            product,
            update_data
        )

        # Step 3: Refresh from the database and check updates
        updated_product.refresh_from_db()

        # Assertions to verify the update
        self.assertEqual(updated_product.name, "Updated Product 3")
        self.assertEqual(updated_product.price, 10.00)
        self.assertEqual(updated_product.description, "Updated description")

        # Verify that the product still belongs to the same category
        self.assertEqual(updated_product.category.name, "Electronics")

        # Verify that the product now has 2 tags
        self.assertEqual(updated_product.tags.count(), 2)

        # Check that both "Tag1" and "Tag2" are now associated with the product
        tags = updated_product.tags.all()
        self.assertIn("Tag1", [tag.name for tag in tags])
        self.assertIn("Tag2", [tag.name for tag in tags])
