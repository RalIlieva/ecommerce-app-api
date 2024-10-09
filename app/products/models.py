"""
Products model.
"""
import uuid
import os

from django.utils.text import slugify
from django.conf import settings
from django.db import models

from PIL import (
    Image,
)

from core.models import (
    TimeStampedModel,
    UUIDModel
)


def product_image_file_path(instance, filename):
    """Generate file path for new product image using UUID."""
    # Get the file extension
    ext = os.path.splitext(filename)[1]
    # Generate a new filename with UUID
    filename = f'{uuid.uuid4()}{ext}'
    return os.path.join('uploads', 'product', filename)


class Category(UUIDModel, TimeStampedModel):
    """ Category for products."""
    name = models.CharField(max_length=255)
    # Prevent deletion of categories to children products.
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='children'
    )
    slug = models.SlugField(
        unique=True,
        db_index=True
    )

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


class Tag(UUIDModel, models.Model):
    """Tags for products."""
    name = models.CharField(max_length=255)
    slug = models.SlugField(
        unique=True,
        db_index=True
    )

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(UUIDModel, TimeStampedModel):
    """Product model."""
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(
        Category,
        related_name='products',
        on_delete=models.CASCADE
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name='products')
    stock = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)
    slug = models.SlugField(
        unique=True,
        db_index=True,
        blank=True
    )

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    """Model representing an image associated with a product."""
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to=product_image_file_path)
    alt_text = models.CharField(max_length=255, blank=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.resize_image()

    def resize_image(self):
        img = Image.open(self.image.path)
        max_size = (800, 800)
        img.thumbnail(max_size, Image.LANCZOS)
        img.save(self.image.path)

    def __str__(self):
        return f'Image for {self.product.name}'


class Review(UUIDModel, TimeStampedModel):
    """Reviews for users that are customers."""
    product = models.ForeignKey(
        Product, related_name='reviews',
        on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()

    def __str__(self):
        return f"Review for {self.product.name} by {self.user.email}"
