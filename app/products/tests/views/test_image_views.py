"""
Test API views for products images.
"""

from random import randint

import tempfile
import os

from PIL import Image

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from products.models import (
    Product,
    Category,
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


class ImageUploadTests(TestCase):
    """
    Tests for the image upload API.
    (POST/products/<id>/images/upload/)
    """

    def setUp(self):
        self.client = APIClient()
        self.admin_user = create_admin_user(
            email='admin_user@example.com',
            password='password123',
        )
        self.client.force_authenticate(self.admin_user)
        self.product = create_product(
            name='Product with image',
            slug='product-with-image'
        )

    def tearDown(self):
        ProductImage.objects.filter(product=self.product).delete()

    def test_upload_image(self):
        """Test uploading an image to a product."""
        # url = image_upload_url(self.product.id)
        url = image_upload_url(self.product.uuid, self.product.slug)
        with tempfile.NamedTemporaryFile(suffix='.jpg') as image_file:
            img = Image.new('RGB', (10, 10))
            img.save(image_file, format='JPEG')
            image_file.seek(0)
            payload = {'image': image_file}
            res = self.client.post(url, payload, format='multipart')

        self.product.refresh_from_db()
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('image', res.data)

        # Check that the image was saved to the correct path
        product_image = ProductImage.objects.filter(
            product=self.product
        ).first()
        self.assertTrue(product_image)
        self.assertTrue(os.path.exists(product_image.image.path))

    def test_upload_image_bad_request(self):
        """Test uploading invalid image."""
        # url = image_upload_url(self.product.id)
        url = image_upload_url(self.product.uuid, self.product.slug)
        payload = {'image': 'notanimage'}
        res = self.client.post(url, payload, format='multipart')

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_image(self):
        """
        Test deleting an image from a product.
        (DELETE /products/<id>/images/<image_id>/delete/)
        """
        # Step 1: Upload an image to the product
        # url = image_upload_url(self.product.id)
        url = image_upload_url(self.product.uuid, self.product.slug)
        with tempfile.NamedTemporaryFile(suffix='.jpg') as image_file:
            img = Image.new('RGB', (10, 10))
            img.save(image_file, format='JPEG')
            image_file.seek(0)
            payload = {'image': image_file}
            upload_response = self.client.post(
                url, payload,
                format='multipart'
            )

        # Ensure the image upload was successful
        self.product.refresh_from_db()
        self.assertEqual(upload_response.status_code, status.HTTP_201_CREATED)
        self.assertIn('image', upload_response.data)

        # Verify the image object in the database
        product_image = ProductImage.objects.filter(
            product=self.product
        ).first()
        self.assertTrue(product_image)
        self.assertTrue(os.path.exists(product_image.image.path))

        # Step 2: Delete the image
        # delete_url = reverse(
        #     'products:product-image-delete',
        #     args=[self.product.id, product_image.id]
        # )
        delete_url = image_delete_url(
            self.product.uuid,
            self.product.slug,
            product_image.id
        )
        delete_response = self.client.delete(delete_url)

        # Step 3: Check if the response status code is 204 No Content
        self.assertEqual(
            delete_response.status_code,
            status.HTTP_204_NO_CONTENT
        )

        # Step 4: Check the image is removed from the db
        self.assertFalse(
            ProductImage.objects.filter(
                id=product_image.id
            ).exists()
        )

        # Step 5: Optionally check the file deleted from the file system
        self.assertFalse(os.path.exists(product_image.image.path))
