"""
Test API views for products.
"""
import uuid
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
)
from products.serializers import ProductMiniSerializer, ProductDetailSerializer


PRODUCTS_URL = reverse('products:product-list')
CREATE_PRODUCTS_URL = reverse('products:product-create')


def detail_url(product_id):
    """Create and return a product detail URL."""
    return reverse('products:product-detail', args=[product_id])


def manage_url(product_id):
    """Manage - update, delete a product detail URL."""
    return reverse('products:product-manage', args=[product_id])


# def image_upload_url(product_id):
#     """Create and return an image upload URL."""
#     return reverse('products:product-upload-image', args=[product_id])


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

        # print("Test payload:", payload)  # Debug print statement
        # print("Response data:", res.data)  # Debug print statement

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
        product = create_product(name='Product with tags', slug='product-with-tags')
        tag1, created = Tag.objects.get_or_create(name='Tag1', slug='tag1')
        tag2, created = Tag.objects.get_or_create(name='Tag2', slug='tag2')
        product.tags.add(tag1, tag2)

        self.assertIn(tag1, product.tags.all())
        self.assertIn(tag2, product.tags.all())

    def test_adding_tags_to_product_second(self):
        """Test adding tags to a product."""
        product = create_product(name='Product with tags', slug='product-with-tags')
        tag1 = Tag.objects.create(name='Tag1', slug=f'tag1-{uuid.uuid4()}')
        tag2 = Tag.objects.create(name='Tag2', slug=f'tag2-{uuid.uuid4()}')
        product.tags.add(tag1, tag2)

        self.assertIn(tag1, product.tags.all())
        self.assertIn(tag2, product.tags.all())

    def test_removing_tags_from_product(self):
        """Test removing tags from a product."""
        product = create_product(name='Product with tags', slug='product-with-tags')
        tag3, created = Tag.objects.get_or_create(name='Tag3', slug='tag3')
        product.tags.add(tag3)
        product.tags.remove(tag3)

        self.assertNotIn(tag3, product.tags.all())

    def test_updating_tags_does_not_affect_other_products(self):
        """Ensure updating tags of one product does not affect other products."""
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
        product = create_product(name='Product with review', slug='product-with-review')
        user = create_user(email='reviewer@example.com', password='test_pass')
        review = Review.objects.create(
            product=product,
            user=user,
            rating=4,
            comment='Great product!'
        )

        self.assertEqual(product.reviews.count(), 1)
        self.assertEqual(product.reviews.first().rating, 4)

    def test_updating_review(self):
        """Test updating a review for a product."""
        product = create_product(name='Product with review', slug='product-with-review')
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
        product = create_product(name='Product with review', slug='product-with-review')
        user = create_user(email='reviewer@example.com', password='test_pass')
        review = Review.objects.create(
            product=product,
            user=user,
            rating=4,
            comment='Great product!'
        )
        review.delete()

        self.assertEqual(product.reviews.count(), 0)


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
