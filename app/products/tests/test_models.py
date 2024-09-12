"""
Test the product models.
"""

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from products.models import (
    Category,
    Product,
    Tag,
    ProductImage,
    Review
)


class CategoryModelTest(TestCase):
    """Test for creating category model."""
    def test_create_category(self):
        category = Category.objects.create(
            name="Electronics",
            slug="electronics"
        )
        self.assertEqual(category.name, "Electronics")
        self.assertEqual(category.slug, "electronics")

    def test_category_str(self):
        """Test the string representation of the category."""
        category = Category.objects.create(
            name="Electronics",
            slug="electronics"
        )
        self.assertEqual(str(category), "Electronics")

    def test_category_with_parent(self):
        """Test creating a category with a parent."""
        parent_category = Category.objects.create(name="Parent", slug="parent")
        child_category = Category.objects.create(
            name="Child",
            slug="child",
            parent=parent_category
        )
        self.assertEqual(child_category.parent, parent_category)
        self.assertEqual(child_category.name, "Child")


class ProductModelTest(TestCase):
    """Test creating a product with an existing category."""

    def setUp(self):
        """Create a category for products."""
        self.category = Category.objects.create(
            name="Generic",
            slug="generic"
        )

    def test_create_product(self):
        category = Category.objects.create(
            name="Electronics",
            slug="electronics"
        )
        product = Product.objects.create(
            name="Product 2",
            description="Test description",
            price=10.00,
            category=category,
            stock=5,
            slug="product-2"
        )
        self.assertEqual(product.name, "Product 2")
        self.assertEqual(product.price, 10.00)
        self.assertEqual(product.category.name, "Electronics")

    def test_product_str(self):
        """Test the string representation of the product."""
        product = Product.objects.create(
            name="Product 2",
            description="Test description",
            price=10.00,
            category=self.category,
            stock=5,
            slug="product-2"
        )
        self.assertEqual(str(product), "Product 2")


class TagModelTest(TestCase):
    """Test for creating tag model."""

    def test_create_tag(self):
        tag = Tag.objects.create(name="Sale", slug="sale")
        self.assertEqual(tag.name, "Sale")
        self.assertEqual(tag.slug, "sale")

    def test_tag_auto_slug(self):
        """Test tag slug is automatically generated."""
        tag = Tag.objects.create(name="New Arrival")
        self.assertEqual(tag.slug, "new-arrival")

    def test_tag_str(self):
        """Test the string representation of the tag."""
        tag = Tag.objects.create(name="Featured")
        self.assertEqual(str(tag), "Featured")


class ProductImageModelTest(TestCase):
    """Test creating and managing product images."""

    def setUp(self):
        """Create a product for testing images."""
        self.category = Category.objects.create(
            name="Electronics",
            slug="electronics"
        )
        self.product = Product.objects.create(
            name="Product 2",
            description="Test description",
            price=10.00,
            category=self.category,
            stock=5,
            slug="product-2"
        )

    def test_create_product_image(self):
        """Test creating a product image."""
        image = SimpleUploadedFile(
            name='test_image.jpg',
            content=b'\x00\x01\x02',
            content_type='image/jpeg'
        )
        product_image = ProductImage.objects.create(
            product=self.product,
            image=image,
            alt_text="Test Image"
        )
        self.assertEqual(product_image.product, self.product)
        self.assertEqual(product_image.alt_text, "Test Image")
        self.assertIn('uploads/product/', product_image.image.name)

    def test_product_image_str(self):
        """Test the string representation of product images."""
        image = SimpleUploadedFile(
            name='test_image.jpg',
            content=b'\x00\x01\x02',
            content_type='image/jpeg'
        )
        product_image = ProductImage.objects.create(
            product=self.product,
            image=image,
            alt_text="Test Image"
        )
        self.assertEqual(str(product_image), f'Image for {self.product.name}')


class ReviewModelTest(TestCase):
    """Test creating reviews for products."""

    def setUp(self):
        """Create a user and product for testing reviews."""
        self.user = get_user_model().objects.create_user(
            email='testuser@example.com',
            password='password123'
        )
        self.category = Category.objects.create(name="Electronics", slug="electronics")
        self.product = Product.objects.create(
            name="Product 2",
            description="Test description",
            price=10.00,
            category=self.category,
            stock=5,
            slug="product-2"
        )

    def test_create_review(self):
        """Test creating a review for a product."""
        review = Review.objects.create(
            product=self.product,
            user=self.user,
            rating=5,
            comment="Great product!"
        )
        self.assertEqual(review.product, self.product)
        self.assertEqual(review.user, self.user)
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.comment, "Great product!")

    def test_review_str(self):
        """Test the string representation of a review."""
        review = Review.objects.create(
            product=self.product,
            user=self.user,
            rating=4,
            comment="Good product."
        )
        self.assertEqual(str(review), f"Review for {self.product.name} by {self.user.email}")
