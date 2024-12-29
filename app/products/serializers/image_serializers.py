"""
Product images serializers.
"""
from rest_framework import serializers
from ..models import ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for uploading images to products."""
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'image_url']
        read_only_fields = ['id', 'image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None


# class ProductImageSerializer(serializers.ModelSerializer):
#     """Serializer for uploading images to products."""
#     class Meta:
#         model = ProductImage
#         fields = ['id', 'image', 'alt_text']
#         read_only_fields = ['id']
