"""
Test API views for products - for vendors.
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
    Review,
)
from products.serializers import (
    ProductMiniSerializer,
    ProductDetailSerializer
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


class ProductListViewTest(TestCase):
    """
    Test product API list views.
    (GET/products/)
    """
    def setUp(self):
        self.client = APIClient()

        # Create a vendor user
        self.vendor_user = create_vendor_user(
            email='vendor@example.com',
            password='vendorpass'
        )
        self.client.force_authenticate(user=self.vendor_user)

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

    def test_search_product_by_name(self):
        """Test searching for products by name"""
        self.product1 = create_product(name='Test Product 1', slug='product-1')
        self.product2 = create_product(name='Test Product 2', slug='product-2')

        res = self.client.get(PRODUCTS_URL, {'search': 'Test Product 1'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn(
            self.product1.id,
            [product['id'] for product in res.data['results']]
        )


class ProductCreateViewTest(TestCase):
    """
    Test creating products.
    (POST/products/create/)
    """

    def setUp(self):
        self.client = APIClient()

        # Create a vendor user
        self.vendor_user = create_vendor_user(
            email='vendor@example.com',
            password='vendorpass'
        )
        self.client.force_authenticate(user=self.vendor_user)

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
        # product = Product.objects.get(id=res.data['id'])
        product = Product.objects.get(uuid=res.data['uuid'])
        self.assertEqual(product.name, "Test Product")
        self.assertEqual(product.category.slug, "new-category")

    def test_create_product_non_vendor_forbidden(self):
        """Test creating a product as a non-vendor"""
        non_admin_user = create_user(
            email='user@example.com',
            password='userpass'
        )
        self.client.force_authenticate(non_admin_user)
        payload = {'name': 'Unauthorized Product'}
        res = self.client.post(CREATE_PRODUCTS_URL, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


class ProductDetailViewTest(TestCase):
    """
    Test retrieving product detail view.
    (GET/products/<id>)
    """

    def setUp(self):
        self.client = APIClient()

        # Create a vendor user
        self.vendor_user = create_vendor_user(
            email='vendor@example.com',
            password='vendorpass'
        )
        self.client.force_authenticate(user=self.vendor_user)

    def test_get_product_detail(self):
        """Test get product detail."""
        product = create_product()

        url = detail_url(product.uuid, product.slug)
        res = self.client.get(url)
        serializer = ProductDetailSerializer(product)
        self.assertEqual(res.data, serializer.data)

    def test_product_detail_view_invalid_uuid(self):
        invalid_uuid = uuid.uuid4()
        slug = "non-existent-slug"
        url = detail_url(invalid_uuid, slug)  # Provide a slug
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_product_detail_view_invalid_slug(self):
        product = create_product(name="Laptop")
        invalid_slug = "invalid-slug"
        # Use invalid slug
        url = detail_url(product.uuid, invalid_slug)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ProductUpdateDeleteViewTest(TestCase):
    """
    Test product update and delete.
    (PUT/PATCH/DELETE/products/<id>)
    """

    def setUp(self):
        self.client = APIClient()

        # Create a vendor user
        self.vendor_user = create_vendor_user(
            email='vendor@example.com',
            password='vendorpass'
        )
        self.client.force_authenticate(user=self.vendor_user)

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
        # url = manage_url(product.id)
        url = manage_url(product.uuid)
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
            'is_active': True
        }
        url = manage_url(product.uuid)
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
        url = manage_url(product.uuid)
        res = self.client.delete(url)

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(uuid=product.uuid).exists())

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
