"""
Business logic - functions - write to db.
"""
# from datetime import timedelta
from rest_framework.exceptions import ValidationError as DRFValidationError
from django.db import transaction
from products.services import update_product_stock
from products.models import Product
# from checkout.models import CheckoutSession
from .models import Order, OrderItem


# Updated function - to include shipping address
@transaction.atomic
def create_order(user, items_data, shipping_address):
    # Ensure items_data is not empty
    if not items_data:
        raise DRFValidationError({'detail': "Items must not be empty"})

    order = Order.objects.create(user=user, shipping_address=shipping_address)

    for item_data in items_data:
        product_uuid = item_data['product']
        try:
            product = Product.objects.select_for_update().get(
                uuid=product_uuid
            )
        except Product.DoesNotExist:
            raise DRFValidationError(
                {'detail': f"Product with UUID {product_uuid} does not exist"}
            )

        quantity = item_data['quantity']
        if quantity <= 0:
            raise DRFValidationError(
                {'detail': "Quantity must be greater than zero"}
            )

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


# TO DELETE - first version
# def get_related_checkout_session(order: Order) -> CheckoutSession | None:
#     """
#     Example approach:
#     1) Filter checkout sessions by the same user.
#     2) Filter sessions created close to the order's creation date
#     (e.g., within 5 minutes).
#     3) Return the most recent one, or None if not found.
#
#     WARNING: This is a 'best-guess' approach
#     if there's no direct relationship.
#     Ideally, store a direct link to checkout (e.g. foreign key).
#     """
#     if not order or not order.user:
#         return None
#
#     # A time window around the order creation (e.g., ±5 minutes).
#     five_minutes_before = order.created - timedelta(minutes=5)
#     five_minutes_after = order.created + timedelta(minutes=5)
#
#     return (
#         CheckoutSession.objects.filter(
#             user=order.user,
#             created__gte=five_minutes_before,
#             created__lte=five_minutes_after
#         )
#         .order_by('-created')
#         .first()
#     )

# @transaction.atomic
# def create_order(user, items_data):
#     # Ensure items_data is not empty
#     if not items_data:
#         raise DRFValidationError({'detail': "Items must not be empty"})
#
#     order = Order.objects.create(user=user)
#
#     for item_data in items_data:
#         product_uuid = item_data['product']
#         try:
#             # Use select_for_update to lock the product
#             # row for the transaction
#             product = Product.objects.select_for_update().get(
#                 uuid=product_uuid
#             )
#             # product = Product.objects.get(uuid=product_uuid)
#         except Product.DoesNotExist:
#             raise DRFValidationError(
#                 {'detail':
#                 f"Product with UUID {product_uuid} does not exist"}
#             )
#
#         quantity = item_data['quantity']
#         # Validate that quantity is greater than zero
#         if quantity <= 0:
#             raise DRFValidationError(
#                 {'detail': "Quantity must be greater than zero"}
#             )
#
#         # Nested transaction for each stock update and item creation
#         with transaction.atomic():
#             update_product_stock(product.uuid, quantity)
#             OrderItem.objects.create(
#                 order=order,
#                 product=product,
#                 quantity=quantity,
#                 price=product.price
#             )
#
#     return order
