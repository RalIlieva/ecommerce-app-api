"""
Business logic - functions - write to db.
"""

from django.shortcuts import get_object_or_404
from products.models import Product
from core.exceptions import (
    ProductAlreadyInWishlistException,
    ProductNotInWishlistException,
    InsufficientStockError
)
from .models import Wishlist, WishlistItem


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
        raise ProductAlreadyInWishlistException()
        # raise ValidationError("Product is already in the wishlist.")

    WishlistItem.objects.create(wishlist=wishlist, product=product)
    return wishlist


def remove_product_from_wishlist(user, product_uuid):
    """
    Remove a product from the user's wishlist.
    """
    wishlist = get_or_create_wishlist(user)

    # Attempt to find the wishlist item that
    # matches the product UUID
    wishlist_item = wishlist.items.filter(
        product__uuid=product_uuid
    ).first()

    # If the wishlist item is not found, raise a custom exception
    if not wishlist_item:
        raise ProductNotInWishlistException()

    # If found, delete the wishlist item
    wishlist_item.delete()


def move_wishlist_item_to_cart(user, product_uuid):
    """
    Move a product from the user's wishlist to the cart.
    """
    from cart.services import add_item_to_cart

    product = get_object_or_404(Product, uuid=product_uuid)

    if product.stock <= 0:
        raise InsufficientStockError()

    remove_product_from_wishlist(user, product_uuid)
    add_item_to_cart(user, product.id, quantity=1)
