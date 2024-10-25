"""
Cart serializers.
"""

from rest_framework import serializers
from .models import Cart, CartItem
from products.serializers import ProductMiniSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductMiniSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items']
        read_only_fields = ['id', 'user', 'items']
