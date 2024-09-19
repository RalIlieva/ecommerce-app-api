"""
Reviews serializers.
"""

from rest_framework import serializers
from ..models import Review


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for product reviews."""
    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'product', 'created_at']
