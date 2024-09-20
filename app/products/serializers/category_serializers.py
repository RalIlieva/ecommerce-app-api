"""
Category serializers.
"""

import re
from django.utils.text import slugify
from rest_framework import serializers
from ..models import Category


class CategoryListSerializer(serializers.ModelSerializer):
    """Serializer for listing categories (user-facing)."""

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']
        read_only_fields = ['id', 'slug']


class CategoryDetailSerializer(serializers.ModelSerializer):
    """Serializer for category detail (user-facing)."""
    products = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'products']
        read_only_fields = ['id', 'slug', 'products']

    def get_products(self, obj):
        from .product_serializers import ProductMiniSerializer  # Deferred import
        products = obj.products.all()
        return ProductMiniSerializer(products, many=True, context=self.context).data


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for categories - for admins."""
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
