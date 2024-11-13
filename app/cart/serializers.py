"""
Cart serializers.
"""

from rest_framework import serializers
from .models import Cart, CartItem
from products.serializers import ProductMiniSerializer


class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializer for CartItem model.
    This serializer provides details for an individual cart item,
    including the associated product details and quantity.
    """
    product = ProductMiniSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'uuid', 'product', 'quantity']
        read_only_fields = ['id', 'uuid']


class CartSerializer(serializers.ModelSerializer):
    """
    Serializer for Cart model.
    This serializer provides details for the user's cart,
    including a list of all cart items and associated user.
    """
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'uuid', 'user', 'items']
        read_only_fields = ['id', 'uuid', 'user', 'items']
