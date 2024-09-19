"""
Product images serializers.
"""

from rest_framework import serializers
from ..models import ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for uploading images to products."""
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text']
        read_only_fields = ['id']
