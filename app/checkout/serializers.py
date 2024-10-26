from rest_framework import serializers
from .models import CheckoutSession
from cart.serializers import CartSerializer


class CheckoutSessionSerializer(serializers.ModelSerializer):
    cart = CartSerializer(read_only=True)
    uuid = serializers.UUIDField(read_only=True)

    class Meta:
        model = CheckoutSession
        fields = [
            'uuid', 'user', 'cart', 'shipping_address', 'status', 'created', 'modified'
        ]
