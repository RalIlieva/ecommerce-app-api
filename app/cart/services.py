# from django.db import transaction
# from .models import Cart, CartItem
# from order.services import create_order
#
#
# def add_to_cart(cart, product, quantity):
#     item, created = CartItem.objects.get_or_create(cart=cart, product=product)
#     if not created:
#         item.quantity += quantity
#     item.save()
#
#
# def remove_from_cart(cart, product):
#     CartItem.objects.filter(cart=cart, product=product).delete()
#
#
# @transaction.atomic
# def convert_cart_to_order(cart):
#     items_data = [{'product': item.product, 'quantity': item.quantity} for item in cart.items.all()]
#     order = create_order(cart.user, items_data)
#     cart.items.all().delete()  # Clear the cart after order creation
#     return order
