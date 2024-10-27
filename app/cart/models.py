"""
Cart models.
"""

from django.db import models
from django.conf import settings
from products.models import Product
from core.models import UUIDModel, TimeStampedModel


class Cart(UUIDModel, TimeStampedModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart'
    )

    def __str__(self):
        return f"Cart for {self.user.email}"

    def get_total(self):
        return sum(item.get_subtotal() for item in self.items.all())


class CartItem(UUIDModel, TimeStampedModel):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='cart_items'
    )
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in cart {self.cart.id}"

    def get_subtotal(self):
        return self.product.price * self.quantity

    class Meta:
        # Each product should be unique per cart
        unique_together = ('cart', 'product')
