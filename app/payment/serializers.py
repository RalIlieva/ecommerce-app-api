"""
Payment serializers.
"""

from rest_framework import serializers
from .models import Payment
from order.models import Order


class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for Payment model.
    """
    # UUID for external references
    uuid = serializers.UUIDField(read_only=True)
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    order = serializers.PrimaryKeyRelatedField(queryset=Order.objects.all())

    class Meta:
        model = Payment
        fields = [
            'uuid', 'user', 'order', 'amount', 'status',
            'stripe_payment_intent_id', 'created', 'modified'
        ]
        read_only_fields = [
            'uuid', 'user', 'stripe_payment_intent_id', 'created', 'modified'
        ]


class CreatePaymentSerializer(serializers.Serializer):
    """
    Serializer for creating a payment.
    """
    order_id = serializers.IntegerField()

    def validate_order_id(self, value):
        # Add additional validation for order_id if needed
        if not Order.objects.filter(id=value).exists():
            raise serializers.ValidationError("Order does not exist.")
        return value
