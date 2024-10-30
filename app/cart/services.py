"""
Business logic - functions - write to db.
"""

from rest_framework.exceptions import ValidationError, NotFound
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from products.models import Product


def get_or_create_cart(user):
    """
       Retrieve or create a cart for the specified user.
       If a cart does not exist for the user, a new one will be created.
       Args:
           user: The user instance for whom the cart is being retrieved
           or created.
       Returns:
           Cart: The cart instance associated with the specified user.
       """
    cart, created = Cart.objects.get_or_create(user=user)
    return cart


def add_item_to_cart(user, product_id, quantity=1):
    """
    Add a specified quantity of a product to the user's cart.

    If the product is already in the cart, the quantity will be incremented.
    Raises an error if the quantity is invalid or exceeds available stock.

    Args:
        user: The user adding the product to their cart.
        product_id: ID of the product to be added.
        quantity: Number of units to add (default is 1).

    Raises:
        ValidationError: If quantity is invalid or exceeds available stock.
        NotFound: If the product with the specified ID does not exist.

    Returns:
        CartItem: The updated or newly created cart item instance.
    """
    cart = get_or_create_cart(user)
    product = get_object_or_404(Product, id=product_id)

    # Check stock availability
    if quantity > product.stock:
        raise ValidationError("Not enough stock available for this product.")

    if quantity <= 0:
        raise ValidationError("Quantity must be greater than zero.")

    cart_item, created = CartItem.objects.get_or_create(
        cart=cart, product=product
    )

    if not created:
        cart_item.quantity += quantity
    else:
        cart_item.quantity = quantity

    cart_item.save()
    return cart_item


def update_cart_item(user, cart_item_uuid, quantity):
    """
    Update the quantity of an item in the user's cart.

    If the new quantity exceeds stock or is zero or less, an error is raised.
    If quantity is zero, the cart item will be removed.

    Args:
        user: The user updating the cart item.
        cart_item_uuid: UUID of the cart item to update.
        quantity: New quantity to set for the cart item.

    Raises:
        ValidationError: If quantity exceeds stock or is zero or less.
        NotFound: If the cart item with the specified UUID
        does not exist in the user's cart.

    Returns:
        CartItem: The updated cart item instance or None if removed.
    """
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
    """
    Remove an item from the user's cart by its UUID.
    If the specified item does not exist in the user's cart,
    a NotFound error is raised.
    Args:
        user: The user removing the item from their cart.
        cart_item_uuid: UUID of the cart item to remove.
    Raises:
        NotFound: If the cart item with the specified UUID
        does not exist in the user's cart.
    Returns: None
    """
    cart = get_or_create_cart(user)
    # Retrieve cart item by its UUID (passed as a string)
    try:
        cart_item = CartItem.objects.get(uuid=cart_item_uuid, cart=cart)
    except CartItem.DoesNotExist:
        raise NotFound("Cart item not found.")
    cart_item.delete()
