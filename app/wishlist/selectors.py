"""
Business logic - fetching from db.
"""

from django.shortcuts import get_object_or_404
from .models import Wishlist, WishlistItem
from django.contrib.auth import get_user_model

User = get_user_model()


def get_user_wishlist(user):
    """Retrieve or create a wishlist for the specified user."""
    return Wishlist.objects.get_or_create(user=user)[0]


def get_wishlist_items(user):
    """Get all items in the user's wishlist."""
    wishlist = get_object_or_404(Wishlist, user=user)
    return wishlist.items.all()


def get_wishlist_item_by_product(user, product_uuid):
    """Get a specific wishlist item by product UUID for a user."""
    wishlist = get_object_or_404(Wishlist, user=user)
    return get_object_or_404(
        WishlistItem,
        wishlist=wishlist,
        product__uuid=product_uuid
    )
