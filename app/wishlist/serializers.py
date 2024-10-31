from rest_framework import serializers
from .models import Wishlist, WishlistItem
from products.serializers import ProductMiniSerializer


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductMiniSerializer(read_only=True)
    product_uuid = serializers.UUIDField(write_only=True)
    in_stock = serializers.SerializerMethodField()

    class Meta:
        model = WishlistItem
        fields = ['uuid', 'product', 'product_uuid', 'created', 'in_stock']
        read_only_fields = ['uuid', 'product', 'created', 'in_stock']

    def get_in_stock(self, obj):
        return obj.product.stock > 0


class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(many=True, read_only=True)

    class Meta:
        model = Wishlist
        fields = ['uuid', 'user', 'items', 'created', 'modified']
        read_only_fields = ['uuid', 'user', 'created', 'modified']
