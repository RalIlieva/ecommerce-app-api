"""
Product serializers.
"""


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

    class Meta:
        model = Product
        fields = ['id', 'uuid', 'name', 'price', 'slug', 'tags', 'category']
        read_only_fields = ['id', 'slug', 'uuid']


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

    def get_reviews(self, obj):
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
