import uuid
from rest_framework.exceptions import ValidationError, NotFound
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from products.models import Product


def get_or_create_cart(user):
    cart, created = Cart.objects.get_or_create(user=user)
    return cart


def add_item_to_cart(user, product_id, quantity=1):
    cart = get_or_create_cart(user)
    product = get_object_or_404(Product, id=product_id)

    if quantity <= 0:
        raise ValidationError("Quantity must be greater than zero.")

    cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)

    if not created:
        # Update quantity if the item already exists in the cart
        cart_item.quantity += quantity
    else:
        cart_item.quantity = quantity

    cart_item.save()
    return cart_item


def update_cart_item(user, cart_item_uuid, quantity):
    cart = get_or_create_cart(user)
    # Retrieve cart item by its UUID (passed as a string)
    try:
        cart_item = CartItem.objects.get(uuid=cart_item_uuid, cart=cart)
    except CartItem.DoesNotExist:
        raise NotFound("Cart item not found.")

    if quantity <= 0:
        cart_item.delete()  # Remove item if quantity is zero or less
    else:
        cart_item.quantity = quantity
        cart_item.save()

    return cart_item


def remove_item_from_cart(user, cart_item_uuid):
    cart = get_or_create_cart(user)
    # Retrieve cart item by its UUID (passed as a string)
    try:
        cart_item = CartItem.objects.get(uuid=cart_item_uuid, cart=cart)
    except CartItem.DoesNotExist:
        raise NotFound("Cart item not found.")
    cart_item.delete()


# from django.db import transaction
# from .models import Cart, CartItem
# from order.services import create_order
#
#
# def add_to_cart(cart, product, quantity):
#     item, created = CartItem.objects.get_or_create(
#     cart=cart,
#     product=product
#     )
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
#     items_data = [
#     {'product': item.product,
#     'quantity': item.quantity} for item in cart.items.all()
#     ]
#     order = create_order(cart.user, items_data)
#     cart.items.all().delete()  # Clear the cart after order creation
#     return order
