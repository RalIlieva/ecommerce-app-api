"""
Wishlist models.
"""

from django.db import models
from django.conf import settings
from core.models import UUIDModel, TimeStampedModel
from products.models import Product


class Wishlist(UUIDModel, TimeStampedModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wishlist'
    )

    def __str__(self):
        return f"Wishlist for {self.user.email}"


class WishlistItem(UUIDModel, TimeStampedModel):
    wishlist = models.ForeignKey(
        Wishlist,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='wishlist_items'
    )

    class Meta:
        unique_together = ('wishlist', 'product')

    def __str__(self):
        return f"{self.product.name} in wishlist of {self.wishlist.user.email}"
