"""
Business logic - functions - write to db.
"""

from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import ValidationError
from django.db import transaction
from products.services import update_product_stock
from products.models import Product
from .models import Order, OrderItem


@transaction.atomic
def create_order(user, items_data):
    order = Order.objects.create(user=user)

    # for item_data in items_data:
    #     # Fetch the product by UUID from the database
    #     try:
    #         product = Product.objects.get(uuid=item_data['product'])
    #     except ObjectDoesNotExist:
    #         raise ValidationError("Invalid product UUID")
    #
    #     quantity = item_data['quantity']
    #
    #     # Ensure sufficient stock before creating order item
    #     if product.stock < quantity:
    #         raise ValidationError("Not enough stock available")
    #
    #     OrderItem.objects.create(
    #         order=order,
    #         product=product,
    #         quantity=quantity,
    #         price=product.price
    #     )
    #
    #     # Update stock after successful item creation
    #     update_product_stock(product.uuid, quantity)
    #
    # return order

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
