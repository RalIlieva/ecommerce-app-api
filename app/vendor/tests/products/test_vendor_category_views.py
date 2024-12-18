"""
Test API views for products categories - for vendors.
"""
import uuid
from random import randint

from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from products.models import (
    Product,
    Category,
)


PRODUCTS_URL = reverse('vendor:products:vendor-product-list')
CREATE_PRODUCTS_URL = reverse('vendor:products:vendor-product-create')
CATEGORY_URL = reverse('vendor:categories:vendor-category-list')
CREATE_CATEGORY_URL = reverse('vendor:categories:vendor-category-create')
TAG_URL = reverse('vendor:tags:vendor-tag-list')
TAG_CREATE_URL = reverse('vendor:tags:vendor-tag-create')


def detail_url(product_uuid, slug):
    """
    Create and return a product detail URL with UUID and slug.
    """
    return reverse(
        'vendor:products:vendor-product-detail',
        args=[product_uuid, slug]
    )


def manage_url(product_uuid):
    """Manage - update, delete a product detail URL."""
    return reverse(
        'vendor:products:vendor-product-manage',
        args=[product_uuid]
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


def create_vendor_user(**params):
    """
    Create and return a new vendor user,
    ensuring they belong to the 'vendor' group.
    """
    user = get_user_model().objects.create_user(**params)
    vendor_group, created = Group.objects.get_or_create(name='vendor')
    user.groups.add(vendor_group)
    return user


def create_user(**params):
    """Create and return a new admin user."""
    return get_user_model().objects.create_user(**params)


class CategoryListViewTest(TestCase):
    """
    Test categories list views.
    (GET/categories/)
    """
    def setUp(self):
        self.client = APIClient()

        # Create a vendor user
        self.vendor_user = create_vendor_user(
            email='vendor@example.com',
            password='vendorpass'
        )
        self.client.force_authenticate(user=self.vendor_user)

        Category.objects.create(name="Electronics", slug="electronics")

        Category.objects.create(
            name="Books",
            slug="books"
        )

    def test_retrieve_category_list(self):
        """Test retrieving the list of categories"""
        res = self.client.get(CATEGORY_URL)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 2)


class CategoryCreateViewTest(TestCase):
    """
    Test creating categories
    (POST/categories/create/)
    """

    def setUp(self):
        self.client = APIClient()
        # Create a vendor user
        self.vendor_user = create_vendor_user(
            email='vendor@example.com',
            password='vendorpass'
        )
        self.client.force_authenticate(user=self.vendor_user)

        self.non_vendor_user = create_user(
            email='user@example.com',
            password='userpass'
        )

    def test_create_category_as_admin(self):
        """Test creating a category as an admin"""
        self.client.force_authenticate(user=self.vendor_user)
        payload = {
            'name': 'Testing Creating New Category',
            'slug': 'testing-creating-new-category',
        }
        res = self.client.post(CREATE_CATEGORY_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_create_category_as_non_admin(self):
        """Test creating a category as a non-vendor"""
        self.client.force_authenticate(user=self.non_vendor_user)
        payload = {
            'name': 'Unauthorized Category',
            'slug': 'unauthorized-category'
        }
        res = self.client.post(CREATE_CATEGORY_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_category_with_duplicate_slug(self):
        """
        Test creating a category with an existing slug raises a 400 error.
        """
        self.client.force_authenticate(user=self.vendor_user)
        Category.objects.create(
            name="Existing Category",
            slug="existing-slug"
        )

        payload = {
            "name": "New Category",
            "slug": "existing-slug"
        }

        response = self.client.post(
            CREATE_CATEGORY_URL, payload,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertIn(
            'Category with this slug already exists.',
            str(response.content)
        )


class CategoryUpdateDeleteViewTest(TestCase):
    """
    Tests for update and delete of categories.
    (PUT/PATCH/DELETE/categories/<id>/)
    """

    def setUp(self):
        self.client = APIClient()
        # Create a vendor user
        self.vendor_user = create_vendor_user(
            email='vendor@example.com',
            password='vendorpass'
        )
        self.client.force_authenticate(user=self.vendor_user)

        self.non_vendor_user = create_user(
            email='user@example.com',
            password='userpass'
        )
        self.category = Category.objects.create(
            name='Old Category',
            slug='old-category'
        )
        self.url = reverse(
            'vendor:categories:vendor-category-manage',
            args=[self.category.uuid]
        )

    def test_update_category_as_vendor(self):
        """
        Test updating a category as a vendor
        """
        self.client.force_authenticate(user=self.vendor_user)
        payload = {'name': 'Updated Category'}
        res = self.client.patch(self.url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.category.refresh_from_db()
        self.assertEqual(self.category.name, 'Updated Category')

    def test_delete_category_as_vendor(self):
        """
        Test deleting a category as a vendor
        """
        self.client.force_authenticate(user=self.vendor_user)
        res = self.client.delete(self.url)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

    def test_update_delete_category_as_non_vendor(self):
        """
        Test updating or deleting a category as a non-vendor
        """
        self.client.force_authenticate(user=self.non_vendor_user)
        payload = {'name': 'Unauthorized Update'}
        update_res = self.client.patch(self.url, payload, format='json')
        delete_res = self.client.delete(self.url)
        self.assertEqual(update_res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(delete_res.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_delete_invalid_category(self):
        """
        Test updating or deleting a category with an invalid ID
        """
        self.client.force_authenticate(user=self.vendor_user)
        # Generate a random UUID
        invalid_uuid = uuid.uuid4()
        invalid_url = reverse(
            'vendor:products:vendor-product-manage',
            args=[invalid_uuid]
        )
        update_res = self.client.patch(
            invalid_url,
            {'name': 'Invalid Category'},
            format='json'
        )
        delete_res = self.client.delete(invalid_url)
        self.assertEqual(update_res.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(delete_res.status_code, status.HTTP_404_NOT_FOUND)


class ProductCategoryDeletionTest(TestCase):
    """
    Test the impact of category deletion on products.
    """
    def setUp(self):
        # Set up initial data
        self.category = Category.objects.create(
            name="Electronics",
            slug="electronics"
        )
        self.product = Product.objects.create(
            name="Product 1",
            description="Test product",
            price=10.00,
            category=self.category,
            stock=5,
            slug="product-1"
        )

    def test_category_deletion(self):
        """
        Test that deleting a category deletes associated products.
        """
        self.category.delete()
        with self.assertRaises(Product.DoesNotExist):
            Product.objects.get(id=self.product.id)

    def test_category_deletion_prevention(self):
        """
        Test deleting a category with associated products -
        allowed & deletes products.
        """
        # Attempt to delete category
        self.category.delete()
        # Confirm that the product is deleted, not prevented
        with self.assertRaises(Product.DoesNotExist):
            Product.objects.get(id=self.product.id)


class NestedCategoryTest(TestCase):
    """
    Test handling of nested categories.
    """

    def setUp(self):
        self.parent_category = Category.objects.create(
            name="Parent Category",
            slug="parent-category"
        )
        self.child_category = Category.objects.create(
            name="Child Category",
            slug="child-category",
            parent=self.parent_category
        )
        self.product = Product.objects.create(
            name="Test Product with Nested Category",
            price=30.00,
            slug="test-product-nested",
            category=self.child_category,
            description="A product for testing nested category behavior.",
            stock=5
        )

    def test_product_with_nested_category(self):
        """
        Test product assignment to a nested category.
        """
        product = Product.objects.get(id=self.product.id)
        self.assertEqual(
            product.category.name,
            "Child Category",
            "Product should be assigned to the child category."
        )
        self.assertEqual(
            product.category.parent.name,
            "Parent Category",
            "Child category's parent should be the parent category."
        )

    def test_change_nested_category(self):
        """
        Test changing a product's category to another nested category.
        """
        new_child_category = Category.objects.create(
            name="New Child Category",
            slug="new-child-category",
            parent=self.parent_category
        )
        self.product.category = new_child_category
        self.product.save()

        product = Product.objects.get(id=self.product.id)
        self.assertEqual(
            product.category.name,
            "New Child Category",
            "Product's category should be updated to new child category."
        )
        self.assertEqual(
            product.category.parent.name,
            "Parent Category",
            "New child category's parent should be the parent category."
        )


class OrphanProductTest(TestCase):
    """
    Test product handling when a parent category is deleted.
    """

    def setUp(self):
        self.parent_category = Category.objects.create(
            name="Parent Category",
            slug="parent-category"
        )
        self.child_category = Category.objects.create(
            name="Child Category",
            slug="child-category",
            parent=self.parent_category
        )
        self.product = Product.objects.create(
            name="Test Product Orphaning",
            price=40.00,
            slug="test-product-orphan",
            category=self.child_category,
            description="Testing orphaning behavior on category deletion.",
            stock=8
        )

    def test_parent_category_deletion(self):
        """
        Test that deleting a parent category does not delete
        the child category or the product.
        """
        self.parent_category.delete()
        product = Product.objects.get(id=self.product.id)
        child_category = Category.objects.get(id=self.child_category.id)

        self.assertIsNotNone(
            child_category,
            "Child category should not be deleted if parent is deleted."
        )
        self.assertEqual(
            product.category,
            child_category,
            "Product should still be assigned to the child category."
        )
