"""
Reviews serializers.
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers
from users.serializers import UserSerializer
# from .product_serializers import ProductDetailSerializer
from ..models import Review


class ReviewListSerializer(serializers.ModelSerializer):
    """Serializer for listing reviews (user-facing)."""

    class Meta:
        model = Review
        fields = ['id', 'uuid', 'user', 'rating', 'comment', 'created', 'modified']
        read_only_fields = ['id', 'uuid', 'product', 'created', 'modified']


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for product reviews."""
    class Meta:
        model = Review
        fields = ['id', 'uuid',  'user', 'rating', 'comment', 'created', 'modified']
        read_only_fields = ['id', 'uuid', 'product', 'created', 'modified']

    def validate_rating(self, value):
        """
        Ensure the rating is between 1 and 5.
        """
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate(self, data):
        """
        Ensure that a user can only leave one review per product.
        """
        request = self.context.get('request')
        user = request.user
        product = data.get('product')

        if self.instance:
            # Allow updating the existing review
            if self.instance.user != user:
                raise serializers.ValidationError("You can only update your own reviews.")
        else:
            # Creating a new review
            if Review.objects.filter(user=user, product=product).exists():
                raise serializers.ValidationError("You have already reviewed this product.")

        return data

    def create(self, validated_data):
        """
        Assign the user to the review during creation.
        """
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


class ReviewDetailSerializer(serializers.ModelSerializer):
    """Serializer for retrieving review details with nested product and user."""
    user = UserSerializer(read_only=True)
    products = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'uuid', 'products', 'user', 'rating', 'comment', 'created', 'modified']
        read_only_fields = ['id', 'uuid', 'user', 'products', 'created', 'modified']

    def get_products(self, obj):
        # Deferred import to avoid circular dependency
        from .product_serializers import ProductDetailSerializer
        return ProductDetailSerializer(obj.product, context=self.context).data

