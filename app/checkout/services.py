"""
Business logic - functions - write to db.
"""

from order.models import (
    Order,
    OrderItem
)


def create_order_from_cart(cart, user):
    # Create a new order from the cart
    if cart.items.count() == 0:
        return None

    order = Order.objects.create(user=user, status=Order.PENDING)

    for item in cart.items.all():
        OrderItem.objects.create(
            order=order,
            product=item.product,
            quantity=item.quantity,
            price=item.product.price
        )

    return order
