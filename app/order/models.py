"""
Order models.
"""

from django.db import models
from django.conf import settings

from core.models import (
    TimeStampedModel,
    UUIDModel
)
from products.models import Product


class Order(UUIDModel, TimeStampedModel):
    PENDING = 'pending'
    PAID = 'paid'
    SHIPPED = 'shipped'
    CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (PAID, 'Paid'),
        (SHIPPED, 'Shipped'),
        (CANCELLED, 'Cancelled'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='order',
        on_delete=models.CASCADE
    )
    shipping_address = models.ForeignKey(
        # String reference to avoid circular import
        'checkout.ShippingAddress',
        on_delete=models.SET_NULL,
        null=True,
        blank=False
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default=PENDING
    )

    def __str__(self):
        return f"Order {self.id} - {self.user.email} - {self.status}"

    @property
    def total_amount(self):
        # Calculate the total amount by summing all order items for this order
        return sum(
            item.quantity * item.price for item in self.order_items.all()
        )


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        related_name='order_items',
        on_delete=models.CASCADE
    )
    product = models.ForeignKey(
        Product,
        related_name='product_order',
        on_delete=models.PROTECT
    )
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} - {self.quantity} pcs"
