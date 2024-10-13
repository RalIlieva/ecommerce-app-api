# from django.db import models
# from django.conf import settings
# from products.models import Product
#
# from core.models import (
#     TimeStampedModel,
#     UUIDModel
# )
#
#
# class Cart(TimeStampedModel, UUIDModel):
#     user = models.OneToOneField(
#     settings.AUTH_USER_MODEL,
#     on_delete=models.CASCADE
#     )
#
#
# class CartItem(models.Model):
#     cart = models.ForeignKey(
#     Cart, related_name='items',
#     on_delete=models.CASCADE
#     )
#     product = models.ForeignKey(Product, on_delete=models.CASCADE)
#     quantity = models.PositiveIntegerField()
#
#     def __str__(self):
#         return f"{self.product.name} - {self.quantity} pcs"
