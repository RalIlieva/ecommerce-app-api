"""
Serializers for the product models.
"""

from rest_framework import serializers
from .models import Product, ProductImage, Review, Tag, Category
from .services import create_product_with_related_data, update_product_with_related_data


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

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'slug', 'tags']
        read_only_fields = ['id', 'slug']


class ProductDetailSerializer(ProductMiniSerializer):
    """serializer for product detail view."""
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True)
    category = CategorySerializer()

    class Meta(ProductMiniSerializer.Meta):
        model = Product
        fields = ProductMiniSerializer.Meta.fields + ['category', 'description', 'stock', 'images', 'reviews']
        read_only_fields = ['id']

    def create(self, validated_data):
        return create_product_with_related_data(validated_data)

    def update(self, instance, validated_data):
        return update_product_with_related_data(instance, validated_data)
