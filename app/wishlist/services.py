from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError, NotFound
from .models import Wishlist, WishlistItem
from products.models import Product


def get_or_create_wishlist(user):
    wishlist, created = Wishlist.objects.get_or_create(user=user)
    return wishlist


def add_product_to_wishlist(user, product_uuid):
    wishlist = get_or_create_wishlist(user)
    product = get_object_or_404(Product, uuid=product_uuid)

    if WishlistItem.objects.filter(wishlist=wishlist, product=product).exists():
        raise ValidationError("Product is already in the wishlist.")

    WishlistItem.objects.create(wishlist=wishlist, product=product)
    return wishlist


def remove_product_from_wishlist(user, product_uuid):
    wishlist = get_or_create_wishlist(user)
    product = get_object_or_404(Product, uuid=product_uuid)

    try:
        item = WishlistItem.objects.get(wishlist=wishlist, product=product)
        item.delete()
    except WishlistItem.DoesNotExist:
        raise NotFound("Product not found in the wishlist.")


def move_wishlist_item_to_cart(user, product_uuid):
    from cart.services import add_item_to_cart

    product = get_object_or_404(Product, uuid=product_uuid)

    if product.stock <= 0:
        raise ValidationError("This product is currently out of stock.")

    remove_product_from_wishlist(user, product_uuid)
    add_item_to_cart(user, product.id, quantity=1)
