"""
Test API views for products tags - for vendors.
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
    Tag,
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


def image_upload_url(product_uuid, slug):
    """
    Create and return a product image upload URL with UUID and slug.
    """
    return reverse(
        'vendor:images:product-image-upload',
        args=[product_uuid, slug]
    )


def image_delete_url(product_uuid, slug, image_id):
    """
    Create and return a product image delete URL with UUID, slug, and image_id.
    """
    return reverse(
        'vendor:images:product-image-delete',
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


class TagListViewTest(TestCase):
    """
    Test listing tags.
    (GET/tags/)
    """

    def setUp(self):
        self.client = APIClient()
        self.tag1 = Tag.objects.create(name="Tag 1")
        self.tag2 = Tag.objects.create(name="Tag 2")

    def test_list_all_tags(self):
        """Test listing all tags"""
        res = self.client.get(TAG_URL)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 2)


class TagCreateViewTest(TestCase):
    """
    Test tags creation is successful.
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

    def test_create_tag_successful(self):
        """
        Test creating a tag as a vendor.
        """
        payload = {'name': 'New Tag', 'slug': 'new-tag'}
        res = self.client.post(TAG_CREATE_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_create_tag_non_admin_forbidden(self):
        """
        Test creating a tag as a non-vendor.
        """
        non_vendor_user = create_user(
            email='user@example.com',
            password='userpass'
        )
        self.client.force_authenticate(non_vendor_user)
        payload = {'name': 'Unauthorized Tag'}
        res = self.client.post(TAG_CREATE_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_tag_with_duplicate_slug(self):
        """
        Test that creating a tag with an existing slug raises a 400 error.
        """
        # Create a tag with a slug
        Tag.objects.create(
            name="Existing Tag",
            slug="existing-slug"
        )

        # Try to create another tag with the same slug
        payload = {
            "name": "New Tag",
            "slug": "existing-slug"
        }

        response = self.client.post(TAG_CREATE_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            'Tag with this slug already exists.',
            str(response.content)
        )


class TagUpdateDeleteViewTest(TestCase):
    """
    Test updating and deleting tags.
    (PUT/PATCH/DELETE/tags/<id>/)
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
        self.tag = Tag.objects.create(
            name='Old Tag',
            slug='old-tag'
        )
        self.url = reverse('vendor:tags:vendor-tag-manage', args=[self.tag.uuid])

    def test_update_tag_as_admin(self):
        """
        Test updating a tag as a vendor.
        """
        self.client.force_authenticate(user=self.vendor_user)
        payload = {'name': 'Updated Tag'}
        res = self.client.patch(self.url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.tag.refresh_from_db()
        self.assertEqual(self.tag.name, 'Updated Tag')

    def test_delete_tag_as_admin(self):
        """
        Test deleting a tag as an admin
        """
        self.client.force_authenticate(user=self.vendor_user)
        res = self.client.delete(self.url)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

    def test_update_delete_tag_as_non_admin(self):
        """
        Test updating or deleting a tag as a non-vendor.
        """
        self.client.force_authenticate(user=self.non_vendor_user)
        payload = {'name': 'Unauthorized Update'}
        update_res = self.client.patch(self.url, payload, format='json')
        delete_res = self.client.delete(self.url)
        self.assertEqual(update_res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(delete_res.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_delete_invalid_tag(self):
        """
        Test updating or deleting a tag with an invalid ID.
        """
        self.client.force_authenticate(user=self.vendor_user)
        invalid_uuid = uuid.uuid4()
        invalid_url = reverse('vendor:tags:vendor-tag-manage', args=[invalid_uuid])
        update_res = self.client.patch(
            invalid_url,
            {'name': 'Invalid Tag'},
            format='json'
        )
        delete_res = self.client.delete(invalid_url)
        self.assertEqual(update_res.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(delete_res.status_code, status.HTTP_404_NOT_FOUND)
