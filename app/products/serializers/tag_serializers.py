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


class TagSerializer(serializers.ModelSerializer):
    """Serializer for tags."""

    # Remove UniqueValidator
    slug = serializers.CharField(validators=[])

    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'products']
        read_only_fields = ['id', 'products']
