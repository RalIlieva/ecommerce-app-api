"""
Business logic - fetching from db.
"""

from .models import Cart


def get_user_cart(user):
    """
    Retrieve the cart for the specified user.
    This function fetches the user's cart and prefetches
    related items and products for efficient access to cart details.
    If the user does not have a cart, an exception will be raised.
    Args:
    user: The user instance whose cart is being retrieved
    Returns:
        Cart: The cart instance associated with the specified user.
    """
    return Cart.objects.prefetch_related('items__product').get(user=user)


def get_cart_total(user):
    """
    Calculate the total price of all items in the user's cart.
    This function retrieves the user's cart and calculates the total cost
    based on the price and quantity of each item in the cart.
    Args:
        user: The user instance whose cart total is being calculated.
    Returns:
        Decimal: The total price of all items in the user's cart.
    """
    cart = get_user_cart(user)
    total = sum(
        item.product.price * item.quantity for item in cart.items.all()
    )
    return total
