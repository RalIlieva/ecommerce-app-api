# from django.db import models
# from django.conf import settings
# from products.models import Product
#
#
# class Wishlist(models.Model):
#     user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
#
#
# class WishlistItem(models.Model):
#     wishlist = models.ForeignKey(Wishlist, related_name='items', on_delete=models.CASCADE)
#     product = models.ForeignKey(Product, on_delete=models.CASCADE)
#
#     def __str__(self):
#         return f"Wishlist item: {self.product.name}"
