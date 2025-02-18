"""
Checkout models.
"""
from phonenumber_field.modelfields import PhoneNumberField
from django.db import models
from django.conf import settings
from cart.models import Cart
from payment.models import Payment
from core.models import (
    UUIDModel,
    TimeStampedModel
)


class CheckoutSession(UUIDModel, TimeStampedModel):
    STATUS_CHOICES = [
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    cart = models.OneToOneField(
        Cart,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    payment = models.OneToOneField(
        Payment,
        on_delete=models.SET_NULL,
        null=True, blank=True
    )
    shipping_address = models.ForeignKey(
        'checkout.ShippingAddress',  # String reference to avoid circular import
        on_delete=models.SET_NULL,
        null=True,
        blank=False
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='IN_PROGRESS'
    )

    def __str__(self):
        return f"Checkout for user {self.user.email} - {self.status}"


class ShippingAddress(UUIDModel, TimeStampedModel):
    """
    Stores a user's shipping address in a structured format.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    full_name = models.CharField(max_length=255)
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    phone_number = PhoneNumberField(
        blank=False,
        null=False
    )

    def __str__(self):
        return f"{self.full_name}, {self.address_line_1}, {self.city}, {self.country}, {self.phone_number}"
