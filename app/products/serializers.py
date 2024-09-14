"""
Serializers for the product models.
"""

import re
from rest_framework import serializers
# from rest_framework.exceptions import ValidationError
from django.utils.text import slugify

from .models import Product, ProductImage, Review, Tag, Category
from .services import (
    # get_or_create_category,
    create_product_with_related_data,
    update_product_with_related_data
)


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for uploading images to products."""
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text']
        read_only_fields = ['id']


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for categories."""
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent']
        read_only_fields = ['id']

    def to_internal_value(self, data):
        """
        Convert the input data into native Python types and validate it.
        """
        # Extract the fields from the incoming data
        name = data.get('name')
        slug = data.get('slug', slugify(name) if name else '')
        parent_id = data.get('parent')

        # Perform the validation
        errors = {}

        if not name:
            errors['name'] = 'This field is required.'

        # Slug validation
        if not slug:
            errors['slug'] = 'This field is required.'
        elif not re.match(r'^[a-zA-Z0-9_-]+$', slug):
            errors['slug'] = \
                'Slug contains only letters, numbers, hyphens, underscores.'

        # Validate the parent
        if parent_id == '' or parent_id == []:
            parent_id = None  # Handle empty strings or lists for parent

        if parent_id:
            try:
                parent_category = Category.objects.get(id=parent_id)
                if parent_category.id == self.instance.id\
                        if self.instance else None:
                    errors['parent'] = 'A category cannot be its own parent.'

                # Limit the depth of nested categories
                if parent_category.parent:
                    errors['parent'] = \
                        'Categories cannot be nested more than one level.'
            except Category.DoesNotExist:
                errors['parent'] = \
                    f'Parent category with id {parent_id} does not exist.'

        # If there are validation errors, raise a ValidationError
        if errors:
            raise serializers.ValidationError(errors)

        # Return the validated data as native Python types
        return {
            'name': name,
            'slug': slug,
            'parent': parent_category if parent_id else None,
        }

    def create(self, validated_data):
        """Create a category using the validated data."""
        return Category.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """Update a category using the validated data."""
        instance.name = validated_data.get('name', instance.name)
        instance.slug = validated_data.get('slug', instance.slug)
        instance.parent = validated_data.get('parent', instance.parent)
        instance.save()
        return instance


class TagSerializer(serializers.ModelSerializer):
    """Serializer for tags."""

    slug = serializers.CharField(validators=[])  # Remove UniqueValidator

    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']
        read_only_fields = ['id']
        # validators = []  # Remove a default "unique together" constraint.

    # def validate_slug(self, value):
    #     """
    #     Check that the slug is unique only for new tags.
    #     """
    #     # If this is an update (i.e., self.instance exists), we shouldn't validate the slug
    #     if self.instance is not None:
    #         return value
    #
    #     # If it's a new tag, validate slug uniqueness
    #     if Tag.objects.filter(slug=value).exists():
    #         raise serializers.ValidationError("Tag with this slug already exists.")
    #
    #     return value


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for product reviews."""
    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'product', 'created_at']


class ProductMiniSerializer(serializers.ModelSerializer):
    """Basic serializer for product."""
    tags = TagSerializer(many=True, required=False)
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'slug', 'tags', 'category']
        read_only_fields = ['id', 'slug']


class ProductDetailSerializer(ProductMiniSerializer):
    """Serializer for product detail view."""
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, required=False)
    category = CategorySerializer()

    class Meta(ProductMiniSerializer.Meta):
        model = Product
        fields = ProductMiniSerializer.Meta.fields + [
            'category',
            'description',
            'stock',
            'images',
            'reviews'
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        """Delegate creation logic to service layer."""
        return create_product_with_related_data(validated_data)

    def update(self, instance, validated_data):
        """Delegate update logic to service layer."""
        return update_product_with_related_data(instance, validated_data)
