"""
Checkout serializers.
"""

from phonenumber_field.modelfields import PhoneNumberField
from rest_framework import serializers
from .models import CheckoutSession
from core.validators import validate_string_only
from checkout.models import ShippingAddress
from cart.serializers import CartSerializer


class ShippingAddressSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(max_length=255)
    address_line_1 = serializers.CharField(max_length=255, validators=[validate_string_only])
    address_line_2 = serializers.CharField(max_length=255, validators=[validate_string_only], required=False)
    city = serializers.CharField(max_length=100, validators=[validate_string_only])
    postal_code = serializers.CharField(max_length=20)
    country = serializers.CharField(max_length=100, validators=[validate_string_only])
    phone_number = PhoneNumberField()

    class Meta:
        model = ShippingAddress
        fields = [
            'full_name',
            'address_line_1',
            'address_line_2',
            'city',
            'postal_code',
            'country',
            'phone_number'
        ]


class CheckoutSessionSerializer(serializers.ModelSerializer):
    cart = CartSerializer(read_only=True)
    uuid = serializers.UUIDField(read_only=True)
    payment_secret = serializers.SerializerMethodField(read_only=True)
    # shipping_address = serializers.CharField(
    #     required=True,
    #     validators=[validate_string_only]
    # )
    shipping_address = serializers.PrimaryKeyRelatedField(
        queryset=ShippingAddress.objects.all())  # Changed to a ForeignKey field
    # user = serializers.PrimaryKeyRelatedField(required=False)
    new_shipping_address = ShippingAddressSerializer(required=False)

    class Meta:
        model = CheckoutSession
        fields = [
            'uuid', 'user', 'cart', 'shipping_address',
            'new_shipping_address',
            'status',
            'created', 'modified', 'payment_secret'
        ]
        extra_kwargs = {
            'user': {'required': False}  # Allow it to be set in `create`
        }

    def get_payment_secret(self, obj) -> str:
        return getattr(obj, 'payment_secret', None)

    def validate(self, data):
        user = self.context['request'].user
        if not user or not user.is_authenticated:
            raise serializers.ValidationError({"user": "User must be authenticated to checkout."})

        # If a new address is provided, use that instead of the existing one
        if not data.get('shipping_address') and not data.get('new_shipping_address'):
            raise serializers.ValidationError("Shipping address is required.")

        if data.get('shipping_address') and data.get('new_shipping_address'):
            raise serializers.ValidationError(
                "You can either select an existing address or provide a new one, not both.")

        return data

    def create(self, validated_data):
        user = self.context['request'].user  # Ensure user is assigned
        validated_data['user'] = user

        # If a new address is provided, create it and assign to checkout session
        if 'new_shipping_address' in validated_data:
            new_address_data = validated_data.pop('new_shipping_address')
            new_shipping_address = ShippingAddress.objects.create(**new_address_data)
            validated_data['shipping_address'] = new_shipping_address

        return super().create(validated_data)
