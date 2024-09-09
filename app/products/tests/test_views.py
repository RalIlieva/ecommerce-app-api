"""
Test API views for products.
"""
import uuid
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
    Tag,
    Review,
    ProductImage,
)
from products.serializers import ProductMiniSerializer, ProductDetailSerializer


PRODUCTS_URL = reverse('products:product-list')
CREATE_PRODUCTS_URL = reverse('products:product-create')
CATEGORY_URL = reverse('products:category-list')
CREATE_CATEGORY_URL = reverse('products:category-create')
TAG_URL = reverse('products:tag-list')
TAG_CREATE_URL = reverse('products:tag-create')


def detail_url(product_id):
    """Create and return a product detail URL."""
    return reverse('products:product-detail', args=[product_id])


def manage_url(product_id):
    """Manage - update, delete a product detail URL."""
    return reverse('products:product-manage', args=[product_id])


def image_upload_url(product_id):
    """Create and return an image upload URL."""
    return reverse('products:product-image-upload', args=[product_id])


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


class ProductListViewTest(TestCase):
    """Test product API list views."""
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

    def test_retrieve_products(self):
        """Test retrieving a list of products."""
        create_product()
        create_product()

        res = self.client.get(PRODUCTS_URL)
        products = Product.objects.all().order_by('id')
        serializer = ProductMiniSerializer(products, many=True)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['results'], serializer.data)
        self.assertEqual(len(res.data['results']), 2)

    def test_filtering_products_by_category(self):
        """Test filtering products by category."""
        category = Category.objects.create(
            name="Filter Category",
            slug="filter-category"
        )
        product1 = create_product(
            name='Product 1',
            slug='product-1',
            category=category
        )
        product2 = create_product(
            name='Product 2',
            slug='product-2',
            category=category
        )
        # Different category
        product3 = create_product(
            name='Product 3',
            slug='product-3'
        )

        res = self.client.get(PRODUCTS_URL, {'category': category.slug})

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 2)
        self.assertIn(
            product1.id,
            [prod['id'] for prod in res.data['results']]
        )
        self.assertIn(
            product2.id,
            [prod['id'] for prod in res.data['results']]
        )
        self.assertNotIn(
            product3.id,
            [prod['id'] for prod in res.data['results']]
        )

    def test_filtering_products_by_tags(self):
        """Test filtering products by tags."""
        tag1 = Tag.objects.create(name="Filter Tag", slug="filter-tag")
        tag2 = Tag.objects.create(name="Different", slug="different")
        product1 = create_product(name='Product 1', slug='product-1')
        product2 = create_product(name='Product 2', slug='product-2')
        # Different tag
        product3 = create_product(name='Product 3', slug='product-3')
        product1.tags.add(tag1)
        product2.tags.add(tag1)
        product3.tags.add(tag2)

        res = self.client.get(PRODUCTS_URL, {'tags': tag1.id})

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 2)
        self.assertIn(
            product1.id,
            [prod['id'] for prod in res.data['results']]
        )
        self.assertIn(
            product2.id,
            [prod['id'] for prod in res.data['results']]
        )
        self.assertNotIn(
            product3.id,
            [prod['id'] for prod in res.data['results']]
        )

    # def test_search_product_by_name(self):
    #     """Test searching for products by name"""
    #     product1 = create_product(name='Test Product 1', slug='product-1')
    #     product2 = create_product(name='Test Product 2', slug='product-2')
    #
    #     res = self.client.get(PRODUCTS_URL, {'search': 'Test Product 1'})
    #     self.assertEqual(res.status_code, status.HTTP_200_OK)
    #     self.assertIn(self.product1.id, [product['id'] for product in res.data['results']])


class ProductCreateViewTest(TestCase):
    """Test creating products."""

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

    def test_create_product_non_admin_forbidden(self):
        """Test creating a product as a non-admin"""
        non_admin_user = create_user(email='user@example.com', password='userpass')
        self.client.force_authenticate(non_admin_user)
        payload = {'name': 'Unauthorized Product'}
        res = self.client.post(CREATE_PRODUCTS_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


class ProductDetailViewTest(TestCase):
    """Test retrieving product detail view."""

    def setUp(self):
        self.client = APIClient()

        self.admin_user = get_user_model().objects.create_superuser(
            email='admin@example.com',
            password='adminpass'
            )
        self.client.force_authenticate(user=self.admin_user)

    def test_get_product_detail(self):
        """Test get product detail."""
        product = create_product()

        url = detail_url(product.id)
        res = self.client.get(url)
        serializer = ProductDetailSerializer(product)
        self.assertEqual(res.data, serializer.data)


class ProductUpdateDeleteViewTest(TestCase):
    """
    Test product update and delete.
    """

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

    def test_partial_update(self):
        """Test partial update of a product."""
        category = Category.objects.get_or_create(
            name="General Category",
            slug="general-category"
        )[0]

        original_description = 'Initial description'
        product = create_product(
            name='Test Product',
            price=10.00,
            slug='test-product',
            category=category,
            description=original_description,
            stock=2
        )

        payload = {'name': 'Updated Test Name'}
        url = manage_url(product.id)
        res = self.client.patch(url, payload)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        product.refresh_from_db()
        self.assertEqual(product.name, payload['name'])
        self.assertEqual(product.description, original_description)

    def test_full_update(self):
        """Test full update of a product."""
        category = Category.objects.get_or_create(
            name="General Category",
            slug="general-category"
        )[0]

        product = create_product(
            name='Test Product',
            price=10.00,
            slug='test-product',
            category=category,
            description='Original description',
            stock=2
        )

        payload = {
            'name': 'Updated Test Name',
            'price': 12.00,
            'slug': 'updated-test-name',
            'category': {
                'name': 'Updated Category',
                'slug': 'updated-category'
            },
            'description': 'Updated description',
            'stock': 1,
            # 'tags': [],
            'is_active': True
        }
        url = manage_url(product.id)
        res = self.client.put(url, payload, format='json')

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        product.refresh_from_db()
        for k, v in payload.items():
            if k == 'category':
                self.assertEqual(getattr(product, k).name, v['name'])
            else:
                self.assertEqual(getattr(product, k), v)

    def test_delete_product(self):
        """Test deleting a product successful."""
        product = create_product()
        url = manage_url(product.id)
        res = self.client.delete(url)

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(id=product.id).exists())

    def test_adding_tags_to_product_first(self):
        """Test adding tags to a product."""
        product = create_product(
            name='Product with tags',
            slug='product-with-tags'
        )
        tag1, created = Tag.objects.get_or_create(name='Tag1', slug='tag1')
        tag2, created = Tag.objects.get_or_create(name='Tag2', slug='tag2')
        product.tags.add(tag1, tag2)

        self.assertIn(tag1, product.tags.all())
        self.assertIn(tag2, product.tags.all())

    def test_adding_tags_to_product_second(self):
        """Test adding tags to a product."""
        product = create_product(
            name='Product with tags',
            slug='product-with-tags'
        )
        tag1 = Tag.objects.create(name='Tag1', slug=f'tag1-{uuid.uuid4()}')
        tag2 = Tag.objects.create(name='Tag2', slug=f'tag2-{uuid.uuid4()}')
        product.tags.add(tag1, tag2)

        self.assertIn(tag1, product.tags.all())
        self.assertIn(tag2, product.tags.all())

    def test_removing_tags_from_product(self):
        """Test removing tags from a product."""
        product = create_product(
            name='Product with tags',
            slug='product-with-tags'
        )
        tag3, created = Tag.objects.get_or_create(name='Tag3', slug='tag3')
        product.tags.add(tag3)
        product.tags.remove(tag3)

        self.assertNotIn(tag3, product.tags.all())

    def test_updating_tags_does_not_affect_other_products(self):
        """
        Ensure updating tags of one product does not affect other products.
        """
        product1 = create_product(name='Product1', slug='product1')
        product2 = create_product(name='Product2', slug='product2')
        tag4, created = Tag.objects.get_or_create(name='Tag4', slug='tag4')
        product1.tags.add(tag4)

        product2.tags.add(tag4)
        product1.tags.remove(tag4)

        self.assertIn(tag4, product2.tags.all())
        self.assertNotIn(tag4, product1.tags.all())

    def test_creating_review(self):
        """Test creating a review for a product."""
        product = create_product(
            name='Product with review',
            slug='product-with-review'
        )
        user = create_user(
            email='reviewer@example.com',
            password='test_pass'
        )
        Review.objects.create(
            product=product,
            user=user,
            rating=4,
            comment='Great product!'
        )

        self.assertEqual(product.reviews.count(), 1)
        self.assertEqual(product.reviews.first().rating, 4)

    def test_updating_review(self):
        """Test updating a review for a product."""
        product = create_product(
            name='Product with review',
            slug='product-with-review'
        )
        user = create_user(email='reviewer@example.com', password='test_pass')
        review = Review.objects.create(
            product=product,
            user=user,
            rating=4,
            comment='Great product!'
        )
        review.rating = 5
        review.comment = 'Excellent product!'
        review.save()

        self.assertEqual(product.reviews.first().rating, 5)
        self.assertEqual(product.reviews.first().comment, 'Excellent product!')

    def test_deleting_review(self):
        """Test deleting a review."""
        product = create_product(
            name='Product with review',
            slug='product-with-review'
        )
        user = create_user(email='reviewer@example.com', password='test_pass')
        review = Review.objects.create(
            product=product,
            user=user,
            rating=4,
            comment='Great product!'
        )
        review.delete()

        self.assertEqual(product.reviews.count(), 0)


class CategoryListViewTest(TestCase):
    """Test categories list views."""
    def setUp(self):
        self.client = APIClient()

        self.admin_user = get_user_model().objects.create_superuser(
            email='admin@example.com',
            password='adminpass'
        )
        self.client.force_authenticate(user=self.admin_user)

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
    """Test creating categories"""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = create_admin_user(email='admin@example.com', password='adminpass')
        self.non_admin_user = create_user(email='user@example.com', password='userpass')

    # def test_create_category_as_admin(self):
    #     """Test creating a category as an admin"""
    #     self.client.force_authenticate(user=self.admin_user)
    #     payload = {
    #         'name': 'New Category',
    #         'slug': 'new-category',
    #         # 'parent': None
    #     }
    #     res = self.client.post(CREATE_CATEGORY_URL, payload, format='json')
    #     self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_create_category_as_non_admin(self):
        """Test creating a category as a non-admin"""
        self.client.force_authenticate(user=self.non_admin_user)
        payload = {'name': 'Unauthorized Category', 'slug': 'unauthorized-category'}
        res = self.client.post(CREATE_CATEGORY_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


class CategoryUpdateDeleteViewTest(TestCase):
    """Tests for update and delete of categories."""

    # def setUp(self):
    #     self.client = APIClient()
    #     self.admin_user = create_admin_user(email='admin@example.com', password='adminpass')
    #     self.non_admin_user = create_user(email='user@example.com', password='userpass')
    #     self.category = Category.objects.create(name='Old Category', slug='old-category')
    #     self.url = reverse('products:category-manage', args=[self.category.id])
    #
    # def test_update_category_as_admin(self):
    #     """Test updating a category as an admin"""
    #     self.client.force_authenticate(user=self.admin_user)
    #     payload = {'name': 'Updated Category'}
    #     res = self.client.patch(self.url, payload, format='json')
    #     self.assertEqual(res.status_code, status.HTTP_200_OK)
    #     self.category.refresh_from_db()
    #     self.assertEqual(self.category.name, 'Updated Category')
    #
    # def test_delete_category_as_admin(self):
    #     """Test deleting a category as an admin"""
    #     self.client.force_authenticate(user=self.admin_user)
    #     res = self.client.delete(self.url)
    #     self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
    #
    # def test_update_delete_category_as_non_admin(self):
    #     """Test updating or deleting a category as a non-admin"""
    #     self.client.force_authenticate(user=self.non_admin_user)
    #     payload = {'name': 'Unauthorized Update'}
    #     update_res = self.client.patch(self.url, payload, format='json')
    #     delete_res = self.client.delete(self.url)
    #     self.assertEqual(update_res.status_code, status.HTTP_403_FORBIDDEN)
    #     self.assertEqual(delete_res.status_code, status.HTTP_403_FORBIDDEN)
    #
    # def test_update_delete_invalid_category(self):
    #     """Test updating or deleting a category with an invalid ID"""
    #     self.client.force_authenticate(user=self.admin_user)
    #     invalid_url = reverse('products:category-manage', args=[999])
    #     update_res = self.client.patch(invalid_url, {'name': 'Invalid Category'}, format='json')
    #     delete_res = self.client.delete(invalid_url)
    #     self.assertEqual(update_res.status_code, status.HTTP_404_NOT_FOUND)
    #     self.assertEqual(delete_res.status_code, status.HTTP_404_NOT_FOUND)


class ProductCategoryDeletionTest(TestCase):
    """Test the impact of category deletion on products."""
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
        """Test that deleting a category deletes associated products."""
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
    """Test handling of nested categories."""

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
        """Test product assignment to a nested category."""
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
        """Test changing a product's category to another nested category."""
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
    """Test product handling when a parent category is deleted."""

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


class TagListViewTest(TestCase):
    """Test listing tags."""

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
    """Test tags creation is successful."""
    def setUp(self):
        self.client = APIClient()
        self.admin_user = create_admin_user(email='admin@example.com', password='adminpass')
        self.client.force_authenticate(self.admin_user)

    def test_create_tag_successful(self):
        """Test creating a tag as an admin"""
        payload = {'name': 'New Tag', 'slug': 'new-tag'}
        res = self.client.post(TAG_CREATE_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_create_tag_non_admin_forbidden(self):
        """Test creating a tag as a non-admin"""
        non_admin_user = create_user(email='user@example.com', password='userpass')
        self.client.force_authenticate(non_admin_user)
        payload = {'name': 'Unauthorized Tag'}
        res = self.client.post(TAG_CREATE_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


class ImageUploadTests(TestCase):
    """Tests for the image upload API."""

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
        url = image_upload_url(self.product.id)
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
        url = image_upload_url(self.product.id)
        payload = {'image': 'notanimage'}
        res = self.client.post(url, payload, format='multipart')

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_image(self):
        """Test deleting an image from a product."""
        # Step 1: Upload an image to the product
        url = image_upload_url(self.product.id)
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
        delete_url = reverse(
            'products:product-image-delete',
            args=[self.product.id, product_image.id]
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
