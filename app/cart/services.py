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

    # Check stock availability
    if quantity > product.stock:
        raise ValidationError("Not enough stock available for this product.")

    if quantity <= 0:
        raise ValidationError("Quantity must be greater than zero.")

    cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)

    if not created:
        cart_item.quantity += quantity
    else:
        cart_item.quantity = quantity

    cart_item.save()
    return cart_item


def update_cart_item(user, cart_item_uuid, quantity):
    cart = get_or_create_cart(user)
    cart_item = get_object_or_404(CartItem, uuid=cart_item_uuid, cart=cart)

    # Check stock before updating quantity
    if quantity > cart_item.product.stock:
        raise ValidationError("Quantity exceeds available stock.")

    if quantity <= 0:
        cart_item.delete()
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
