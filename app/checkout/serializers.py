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
    address_line_1 = serializers.CharField(
        max_length=255,
        validators=[validate_string_only]
    )
    address_line_2 = serializers.CharField(
        max_length=255,
        validators=[validate_string_only],
        required=False
    )
    city = serializers.CharField(
        max_length=100,
        validators=[validate_string_only]
         )
    postal_code = serializers.CharField(max_length=20)
    country = serializers.CharField(
        max_length=100,
        validators=[validate_string_only]
    )
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

    # Initial version - ID needed
    # shipping_address = serializers.PrimaryKeyRelatedField(
    #     queryset=ShippingAddress.objects.all(),
    #     required=False,
    #     allow_null=True
    # )
    # Nested serializer
    shipping_address = ShippingAddressSerializer(
        required=False,
        allow_null=True
    )
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
            'user': {'required': False}
        }

    def get_payment_secret(self, obj):
        return getattr(obj, 'payment_secret', None)

    def validate(self, data):
        # Safely handle no request in context
        request = self.context.get('request')
        if request is not None:
            user = request.user
            if not user or not user.is_authenticated:
                raise serializers.ValidationError(
                    {"user": "User must be authenticated to checkout."}
                )

        # Must provide shipping_address or new_shipping_address
        if not data.get(
                'shipping_address'
        ) and not data.get('new_shipping_address'):
            raise serializers.ValidationError({
                "shipping_address": ["This field is required."]
            })

        # Cannot provide both
        if data.get('shipping_address') and data.get('new_shipping_address'):
            raise serializers.ValidationError(
                "You can either select an existing address "
                "or provide a new one, not both."
            )

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        # Debugging log
        print("Received validated_data:", validated_data)

        # If a new shipping address is provided,
        # create it and assign to checkout session
        if 'new_shipping_address' in validated_data:
            new_address_data = validated_data.pop('new_shipping_address')
            print(
                "Creating new shipping address with data:",
                new_address_data
            )
            # Ensure linking the user to the new shipping address
            new_shipping_address = ShippingAddress.objects.create(
                user=user, **new_address_data
            )
            validated_data['shipping_address'] = new_shipping_address

        checkout_session = super().create(validated_data)
        print("Created CheckoutSession:", checkout_session)
        print("Shipping Address:", checkout_session.shipping_address)
        return checkout_session

    def update(self, instance, validated_data):
        user = self.context['request'].user

        # Handle updating shipping address inline
        if 'shipping_address' in validated_data:
            shipping_data = validated_data.pop('shipping_address')
            if instance.shipping_address:
                for attr, value in shipping_data.items():
                    setattr(instance.shipping_address, attr, value)
                instance.shipping_address.save()
            else:
                instance.shipping_address = ShippingAddress.objects.create(
                    user=user, **shipping_data
                )

        return super().update(instance, validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.shipping_address:
            data['shipping_address'] = ShippingAddressSerializer(
                instance.shipping_address
            ).data
        return data


# class CheckoutSessionSerializer(serializers.ModelSerializer):
#     cart = CartSerializer(read_only=True)
#     uuid = serializers.UUIDField(read_only=True)
#     payment_secret = serializers.SerializerMethodField(read_only=True)
#     # shipping_address = serializers.CharField(
#     #     required=True,
#     #     validators=[validate_string_only]
#     # )
#     shipping_address = serializers.PrimaryKeyRelatedField(
#         queryset=ShippingAddress.objects.all(),
#         required=False,
#         allow_null=True
#     )  # Changed to a ForeignKey field
#     # user = serializers.PrimaryKeyRelatedField(required=False)
#     new_shipping_address = ShippingAddressSerializer(required=False)
#
#     class Meta:
#         model = CheckoutSession
#         fields = [
#             'uuid', 'user', 'cart', 'shipping_address',
#             'new_shipping_address',
#             'status',
#             'created', 'modified', 'payment_secret'
#         ]
#         extra_kwargs = {
#             'user': {'required': False}  # Allow it to be set in `create`
#         }
#
#     def get_payment_secret(self, obj) -> str:
#         return getattr(obj, 'payment_secret', None)
#
#     def validate(self, data):
#         user = self.context['request'].user
#         if not user or not user.is_authenticated:
#             raise serializers.ValidationError(
#             {"user": "User must be authenticated to checkout."}
#             )
#
#         # If a new address is provided, use that instead of the existing one
#         if not data.get(
#         'shipping_address'
#         ) and not data.get(
#         'new_shipping_address'
#         ):
#             raise serializers.ValidationError({
#                 "shipping_address": ["This field is required."]
#             })
#             # raise serializers.ValidationError(
#             #     "Shipping address is required."
#             # )
#
#         if data.get('shipping_address') and data.get('new_shipping_address'):
#             raise serializers.ValidationError(
#                 "You can either select an existing address or
#                 provide a new one, not both."
#                 )
#
#         return data
#
#     def create(self, validated_data):
#         """
#         If new_shipping_address is provided, create it & set shipping_address
#         to that newly created object. Otherwise, use shipping_address pk.
#         """
#         user = self.context['request'].user  # Ensure user is assigned
#         validated_data['user'] = user
#
#         # If a new address is provided, create & assign to checkout session
#         if 'new_shipping_address' in validated_data:
#             # pop the nested shipping address data
#             new_address_data = validated_data.pop('new_shipping_address')
#             # create a new ShippingAddress for this user
#             new_shipping_address = ShippingAddress.objects.create(
#             **new_address_data
#             )
#             validated_data['shipping_address'] = new_shipping_address
#
#         # return super().create(validated_data)
#         checkout_session = super().create(validated_data)
#         return checkout_session
#
#     def to_representation(self, instance):
#         """
#         Return the full nested shipping address instead of just the pk.
#         """
#         data = super().to_representation(instance)
#
#         # Instead of just returning shipping_address = <pk>,
#         # return the nested address fields.
#         if instance.shipping_address:
#             data['shipping_address'] = ShippingAddressSerializer(
#                 instance.shipping_address
#             ).data
#
#         return data
