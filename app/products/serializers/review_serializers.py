"""
Reviews serializers.
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers
from ..models import Review


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
