"""
Serializers for the product models.
"""

from rest_framework import serializers
# from rest_framework.exceptions import ValidationError
# from django.utils.text import slugify

from .models import Product, ProductImage, Review, Tag, Category
from .services import (
    get_or_create_category,
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
        # if isinstance(data, dict):
        #     name = data.get('name')
        #     # Generate slug if not provided
        #     slug = data.get('slug', slugify(name))
        #
        #     if not name:
        #         raise ValidationError({"name": "This field is required."})
        #
        #     # Check for existing category
        #     category = Category.objects.filter(name=name, slug=slug).first()
        #     if category:
        #         return category
        #
        #     parent_id = data.get('parent')
        #     parent = None
        #     if parent_id:
        #         try:
        #             parent = Category.objects.get(pk=parent_id)
        #         except Category.DoesNotExist:
        #             raise ValidationError(
        #                 f"Parent categ with id {parent_id} does not exist."
        #             )
        #
        #     # Create new category if not found
        #     category, created = Category.objects.get_or_create(
        #         name=name, slug=slug, defaults={'parent': parent}
        #     )
        #     return category
        #
        # raise ValidationError(
        #     {
        #     "category": "Expected a dict with 'name'/optional 'slug' fields."
        #     }
        # )
        return get_or_create_category(data)


class TagSerializer(serializers.ModelSerializer):
    """Serializer for tags."""
    class Meta:
        model = Tag
        fields = ['id', 'name']
        read_only_fields = ['id']


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

    # def create(self, validated_data):
    #     # Extract and process the category data first
    #     category_data = validated_data.pop('category', None)
    #
    #     if isinstance(category_data, Category):
    #         category = category_data  # Already a Category instance
    #     elif isinstance(category_data, dict):
    #         # Convert category_data to Category instance
    #         category = self.fields['category'].
    #         to_internal_value(category_data)
    #     else:
    #         raise ValidationError({"category": "Invalid category data."})
    #
    #     validated_data['category'] = category
    #
    #     # Extract tags data, but do not include it in validated_data yet
    #     tags_data = validated_data.pop('tags', [])
    #
    #     # Create the product with the validated category
    #     product = Product.objects.create(**validated_data)
    #
    #     # Handle the many-to-many r-ship for tags after product is created
    #     for tag_data in tags_data:
    #         tag, created = Tag.objects.get_or_create(**tag_data)
    #         product.tags.add(tag)
    #
    #     return product
    #
    # def update(self, instance, validated_data):
    #     # Handle category update
    #     category_data = validated_data.pop('category', None)
    #
    #     if category_data:
    #         if isinstance(category_data, dict):
    #             # Process category data correctly
    #             category, created = Category.objects.get_or_create(
    #                 name=category_data['name'],
    #                 slug=category_data.get(
    #                     'slug', slugify(category_data['name'])
    #                 ),
    #                 defaults={'parent': category_data.get('parent')}
    #             )
    #         elif isinstance(category_data, Category):
    #             category = category_data  # It's already a Category instance
    #
    #         instance.category = category
    #
    #     # Handle tags update
    #     tags_data = validated_data.pop('tags', None)
    #     if tags_data:
    #         instance.tags.clear()
    #         for tag_data in tags_data:
    #             tag, created = Tag.objects.get_or_create(**tag_data)
    #             instance.tags.add(tag)
    #
    #     # Set the remaining fields
    #     for attr, value in validated_data.items():
    #         setattr(instance, attr, value)
    #
    # Ensure the instance is saved with the updated fields
    #     instance.save()
    #     return instance

    def create(self, validated_data):
        """Delegate creation logic to service layer."""
        return create_product_with_related_data(validated_data)

    def update(self, instance, validated_data):
        """Delegate update logic to service layer."""
        return update_product_with_related_data(instance, validated_data)
