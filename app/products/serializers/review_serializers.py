"""
Reviews serializers.
"""

from rest_framework import serializers
from users.serializers import UserReviewSerializer
from .product_serializers import ProductNestedSerializer
from ..models import Review


class ReviewListSerializer(serializers.ModelSerializer):
    """Serializer for listing reviews (user-facing)."""
    # Security - not to display the users' id, email and personal info
    user = UserReviewSerializer(read_only=True)

    class Meta:
        model = Review
        fields = [
            'id',
            'uuid',
            'user',
            'rating',
            'comment',
            'created',
            'modified'
        ]
        read_only_fields = [
            'id', 'uuid',
            'user', 'product',
            'created', 'modified'
        ]


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for product reviews."""

    rating = serializers.ChoiceField(
        choices=[1, 2, 3, 4, 5],
        error_messages={'invalid_choice': 'Rating must be between 1 and 5.'}
    )

    class Meta:
        model = Review
        fields = [
            'id',
            'uuid',
            'user',
            'rating',
            'comment',
            'created',
            'modified'
        ]
        read_only_fields = [
            'id', 'uuid',
            'user', 'product',
            'created', 'modified'
        ]

    def validate_rating(self, value):
        """
        Ensure the rating is between 1 and 5.
        """
        if not 1 <= value <= 5:
            raise serializers.ValidationError(
                "Rating must be between 1 and 5."
            )
        return value

    def validate(self, data):
        """
        Ensure that a user can only leave one review per product.
        """
        request = self.context.get('request')
        user = request.user
        product = self.context.get('product')

        if self.instance:
            # Allow updating the existing review
            if self.instance.user != user:
                raise serializers.ValidationError(
                    "You can only update your own reviews."
                )
        else:
            # Creating a new review
            if Review.objects.filter(user=user, product=product).exists():
                raise serializers.ValidationError(
                    "You have already reviewed this product."
                )

        return data

    def create(self, validated_data):
        """Assign the user and product to the review during creation."""
        user = self.context['request'].user
        product = self.context.get('product')  # Fetch from context
        return Review.objects.create(
            user=user,
            product=product,
            **validated_data
        )


class ReviewDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving review details with nested product and user.
    """
    # Security - not to display the users' id, email and personal info
    user = UserReviewSerializer(read_only=True)
    product = ProductNestedSerializer(read_only=True)

    class Meta:
        model = Review
        fields = [
            'id',
            'uuid',
            'product',
            'user',
            'rating',
            'comment',
            'created',
            'modified'
        ]
        read_only_fields = [
            'id',
            'uuid',
            'user',
            'product',
            'created',
            'modified'
        ]
