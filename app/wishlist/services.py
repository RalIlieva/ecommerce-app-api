"""
Business logic - functions - write to db.
"""

from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError, NotFound
from .models import Wishlist, WishlistItem
from products.models import Product


def get_or_create_wishlist(user):
    wishlist, created = Wishlist.objects.get_or_create(user=user)
    return wishlist


def add_product_to_wishlist(user, product_uuid):
    """
    Add a product to the user's wishlist.
    """
    wishlist = get_or_create_wishlist(user)
    product = get_object_or_404(Product, uuid=product_uuid)

    if WishlistItem.objects.filter(
            wishlist=wishlist, product=product
    ).exists():
        raise ValidationError("Product is already in the wishlist.")

    WishlistItem.objects.create(wishlist=wishlist, product=product)
    return wishlist


def remove_product_from_wishlist(user, product_uuid):
    """
    Remove a product from the user's wishlist.
    """
    wishlist = get_or_create_wishlist(user)
    try:
        product = Product.objects.get(uuid=product_uuid)
    except Product.DoesNotExist:
        raise NotFound("Product not found.")

    wishlist_item = wishlist.items.filter(product=product).first()
    if wishlist_item:
        wishlist_item.delete()


def move_wishlist_item_to_cart(user, product_uuid):
    """
    Move a product from the user's wishlist to the cart.
    """
    from cart.services import add_item_to_cart

    product = get_object_or_404(Product, uuid=product_uuid)

    if product.stock <= 0:
        raise ValidationError("This product is currently out of stock.")

    remove_product_from_wishlist(user, product_uuid)
    add_item_to_cart(user, product.id, quantity=1)
