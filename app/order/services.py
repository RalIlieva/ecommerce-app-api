"""
Business logic - functions - write to db.
"""

from rest_framework.exceptions import ValidationError as DRFValidationError
from django.db import transaction
from products.services import update_product_stock
from products.models import Product
from .models import Order, OrderItem


@transaction.atomic
def create_order(user, items_data):
    order = Order.objects.create(user=user)

    for item_data in items_data:
        product_uuid = item_data['product']
        try:
            product = Product.objects.get(uuid=product_uuid)
        except Product.DoesNotExist:
            raise DRFValidationError(
                {'detail': f"Product with UUID {product_uuid} does not exist"}
            )

        quantity = item_data['quantity']
        # Validate that quantity is greater than zero
        if quantity <= 0:
            raise DRFValidationError({'detail': "Quantity must be greater than zero"})

        # Nested transaction for each stock update and item creation
        with transaction.atomic():
            update_product_stock(product.uuid, quantity)
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=product.price
            )

    return order


@transaction.atomic
def update_order_status(order, status):
    order.status = status
    order.save()
    return order
