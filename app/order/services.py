"""
Business logic - functions - write to db.
"""

from django.db import transaction
from products.services import update_product_stock
from .models import Order, OrderItem


@transaction.atomic
def create_order(user, items_data):
    order = Order.objects.create(user=user)

    for item_data in items_data:
        product = item_data['product']
        quantity = item_data['quantity']
        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=quantity,
            price=product.price
        )
        update_product_stock(product.uuid, quantity)

    return order


@transaction.atomic
def update_order_status(order, status):
    order.status = status
    order.save()
    return order
