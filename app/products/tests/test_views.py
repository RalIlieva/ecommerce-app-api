"""
Test API views for products.
"""
from random import randint
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils.text import slugify
from rest_framework import status
from rest_framework.test import APIClient
from products.models import Product, Category, Tag
from products.serializers import ProductMiniSerializer, ProductDetailSerializer


PRODUCTS_URL = reverse('products:product-list')
CREATE_PRODUCTS_URL = reverse('products:product-create')


def detail_url(product_id):
    """Create and return a product detail URL."""
    return reverse('products:product-detail', args=[product_id])


# def image_upload_url(product_id):
#     """Create and return an image upload URL."""
#     return reverse('products:product-upload-image', args=[product_id])


def create_product(category=None,slug=None, **params):
    """Create and return a sample product."""
    if category is None:
        # Use get_or_create to avoid creating duplicate categories
        category, _ = Category.objects.get_or_create(name="General Category", slug="general-category")

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


class ProductViewTest(TestCase):
    """Test product API views."""
    def setUp(self):
        self.client = APIClient()

        self.admin_user = get_user_model().objects.create_superuser(
            email='admin@example.com',
            password='adminpass'
        )
        self.client.force_authenticate(user=self.admin_user)

        self.category = Category.objects.create(
            name="Electronics",
            slug="electronics"
        )
        self.tag = Tag.objects.create(name="Tag1", slug="tag1")
        self.product_data = {
            "name": "Product 2",
            "price": 10.00,
            "slug": "product-2",
            "tags": [{"name": "Tag1", "slug": "tag1"}],
            "category": {"name": "Electronics", "slug": "electronics"},
            "description": "Test description",
            "stock": 5
        }

    def test_create_product(self):
        """Test create product."""
        response = self.client.post(
            CREATE_PRODUCTS_URL,
            self.product_data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 1)
        self.assertEqual(Product.objects.get().name, "Product 2")

    def test_create_product_with_existing_category(self):
        """Test create a product with existing category."""
        new_product_data = self.product_data.copy()
        new_product_data["name"] = "Product 3"
        response = self.client.post(
            CREATE_PRODUCTS_URL,
            new_product_data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 1)
        self.assertEqual(Product.objects.get().name, "Product 3")
        self.assertEqual(Product.objects.get().category.name, "Electronics")

    def test_create_product_with_new_category(self):
        """Test creating a new product with new category."""
        payload = {
            "name": "Test Product",
            "price": 12.00,
            "slug": "test-product",
            "tags": [],
            "category": {"name": "New Category", "slug": "new-category"},
            "description": "Test description",
            "stock": 3
        }

        res = self.client.post(CREATE_PRODUCTS_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        product = Product.objects.get(id=res.data['id'])
        self.assertEqual(product.name, "Test Product")
        self.assertEqual(product.category.slug, "new-category")

    def test_retrieve_products(self):
        """Test retrieving a list of products."""
        create_product()
        create_product()

        res = self.client.get(PRODUCTS_URL)
        products = Product.objects.all().order_by('id')
        serializer = ProductMiniSerializer(products, many=True)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)

    def test_get_product_detail(self):
        """Test get product detail."""
        product = create_product()

        url = detail_url(product.id)
        res = self.client.get(url)
        serializer = ProductDetailSerializer(product)
        self.assertEqual(res.data, serializer.data)
