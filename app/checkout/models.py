"""
Checkout models.
"""

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
        on_delete=models.CASCADE
    )
    payment = models.OneToOneField(
        Payment,
        on_delete=models.SET_NULL,
        null=True, blank=True
    )
    shipping_address = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='IN_PROGRESS'
    )

    def __str__(self):
        return f"Checkout for user {self.user.email} - {self.status}"
