"""
Order serializers.
"""

from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductMiniSerializer
from checkout.serializers import ShippingAddressSerializer
# from .services import get_related_checkout_session


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
    total_amount = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    # # Use a SerializerMethodField to dynamically fetch shipping address
    # shipping_address = serializers.SerializerMethodField()
    # shipping_address = serializers.CharField()  # Add shipping address field
    # Return full address
    shipping_address = ShippingAddressSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'uuid', 'user', 'status', 'created', 'modified', 'items',
            'total_amount',
            'shipping_address',
        ]
        read_only_fields = [
            'id', 'uuid',  'user', 'status', 'created', 'modified'
        ]
