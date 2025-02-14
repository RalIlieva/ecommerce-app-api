"""
Order serializers.
"""

from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductMiniSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductMiniSerializer(read_only=True)
    # product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price']
        read_only_fields = ['id', 'product', 'price']


class OrderSerializer(serializers.ModelSerializer):
    #  Nested OrderItemSer to present items within each order
    # items = OrderItemSerializer(many=True, read_only=True)
    items = OrderItemSerializer(source='order_items', many=True)

    class Meta:
        model = Order
        fields = [
            'id', 'uuid', 'user', 'status', 'created', 'modified', 'items'
        ]
        read_only_fields = [
            'id', 'uuid',  'user', 'status', 'created', 'modified'
        ]
