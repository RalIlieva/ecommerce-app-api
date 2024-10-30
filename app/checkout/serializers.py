"""
Checkout serializers.
"""

from rest_framework import serializers
from .models import CheckoutSession
from core.validators import validate_string_only
from cart.serializers import CartSerializer


class CheckoutSessionSerializer(serializers.ModelSerializer):
    cart = CartSerializer(read_only=True)
    uuid = serializers.UUIDField(read_only=True)
    payment_secret = serializers.SerializerMethodField(read_only=True)
    shipping_address = serializers.CharField(
        required=True,
        validators=[validate_string_only]
    )
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = CheckoutSession
        fields = [
            'uuid', 'user', 'cart', 'shipping_address', 'status',
            'created', 'modified', 'payment_secret'
        ]

    def get_payment_secret(self, obj):
        return getattr(obj, 'payment_secret', None)
