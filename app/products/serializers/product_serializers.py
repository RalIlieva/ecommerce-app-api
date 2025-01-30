"""
Product serializers.
"""
from typing import List, Dict, Any
from drf_spectacular.utils import (
    extend_schema_field,
    OpenApiTypes
)
from rest_framework import serializers
from .category_serializers import CategorySerializer
from .tag_serializers import TagSerializer
from .image_serializers import ProductImageSerializer
from ..models import Product
from ..services import (
    create_product_with_related_data,
    update_product_with_related_data
)


class ProductMiniSerializer(serializers.ModelSerializer):
    """Basic serializer for product."""
    tags = TagSerializer(many=True, required=False)
    category = CategorySerializer(read_only=True)
    average_rating = serializers.ReadOnlyField()
    image = serializers.SerializerMethodField()  # Added field

    class Meta:
        model = Product
        fields = [
            'id', 'uuid',
            'name', 'price', 'slug',
            'tags', 'category',
            'average_rating',
            'image',
        ]
        read_only_fields = ['id', 'slug', 'uuid', 'average_rating']

    def get_image(self, obj):
        first_image = obj.images.first()
        if first_image and first_image.image:
            request = self.context.get('request')
            # Build the absolute URL the same way you do in ProductImageSerializer
            return request.build_absolute_uri(first_image.image.url)
        return None


class ProductDetailSerializer(ProductMiniSerializer):
    """Serializer for product detail view."""
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()
    average_rating = serializers.ReadOnlyField()
    tags = TagSerializer(many=True, required=False)
    category = CategorySerializer()

    class Meta(ProductMiniSerializer.Meta):
        model = Product
        fields = ProductMiniSerializer.Meta.fields + [
            'category',
            'description',
            'stock',
            'images',
            'reviews',
            'average_rating',
        ]
        read_only_fields = ['id']

    @extend_schema_field(OpenApiTypes.FLOAT)
    def get_average_rating(self, obj: Product) -> float:
        """Get the average rating of the product."""
        return obj.average_rating

    def get_reviews(self, obj: Product) -> List[Dict[str, Any]]:
        """Get the reviews for the product."""
        # Local import to avoid circularity
        from .review_serializers import ReviewListSerializer
        reviews = obj.reviews.all()
        serializer = ReviewListSerializer(
            reviews,
            many=True,
            context=self.context
        )
        return serializer.data

    def create(self, validated_data):
        """Delegate creation logic to service layer."""
        return create_product_with_related_data(validated_data)

    def update(self, instance, validated_data):
        """Delegate update logic to service layer."""
        return update_product_with_related_data(instance, validated_data)


class ProductNestedSerializer(serializers.ModelSerializer):
    """Serializer for nested product representation without reviews."""
    tags = TagSerializer(many=True, required=False)
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'uuid',
            'name',
            'price',
            'slug',
            'tags',
            'category',
            'description',
            'stock',
            'images'
        ]
        read_only_fields = ['id', 'uuid', 'slug']
