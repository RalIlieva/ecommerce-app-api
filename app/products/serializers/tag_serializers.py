"""
Tag serializers.
"""

from rest_framework import serializers
from ..models import Tag


class TagSerializer(serializers.ModelSerializer):
    """Serializer for tags."""

    # Remove UniqueValidator
    slug = serializers.CharField(validators=[])

    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'products']
        read_only_fields = ['id', 'products']
