"""
Tag serializers.
"""

from rest_framework import serializers
from ..models import Tag


class TagListSerializer(serializers.ModelSerializer):
    """Serializer for listing tags (user-facing)."""

    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']
        read_only_fields = ['id', 'slug']


class TagDetailSerializer(serializers.ModelSerializer):
    """Serializer for tag detail (user-facing)."""
    products = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'products']
        read_only_fields = ['id', 'slug']

    def get_products(self, obj):
        from .product_serializers import ProductMiniSerializer  # Deferred import to avoid circular dependency
        products = obj.products.all()
        return ProductMiniSerializer(products, many=True, context=self.context).data


class TagSerializer(serializers.ModelSerializer):
    """Serializer for tags (admin-facing)."""

    # Remove UniqueValidator
    slug = serializers.CharField(validators=[])

    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'products']
        read_only_fields = ['id', 'products']
