"""
Wishlist serializers.
"""

from rest_framework import serializers
from .models import Wishlist, WishlistItem
from products.serializers import ProductMiniSerializer


class WishlistItemSerializer(serializers.ModelSerializer):
    """
    Serializer for individual items in the user's wishlist.
    Methods:
        - get_in_stock: Determines stock availability
        by checking the product's stock.
    """
    product = ProductMiniSerializer(read_only=True)
    product_uuid = serializers.UUIDField(write_only=True)
    in_stock = serializers.SerializerMethodField()

    class Meta:
        model = WishlistItem
        fields = ['uuid', 'product', 'product_uuid', 'created', 'in_stock']
        read_only_fields = ['uuid', 'product', 'created', 'in_stock']

    def get_in_stock(self, obj: WishlistItem) -> bool:
        """
        Check if the associated product is in stock.
            Args:
            obj (WishlistItem): The wishlist item instance.
            Returns:
            bool: True if the product stock is greater than 0, False otherwise.
        """
        return obj.product.stock > 0


class WishlistSerializer(serializers.ModelSerializer):
    """
    Serializer for the Wishlist model, representing a user's entire wishlist.
    """
    items = WishlistItemSerializer(many=True, read_only=True)

    class Meta:
        model = Wishlist
        fields = ['uuid', 'user', 'items', 'created', 'modified']
        read_only_fields = ['uuid', 'user', 'created', 'modified']
