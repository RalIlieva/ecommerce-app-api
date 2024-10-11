"""
Business logic - fetching from db.
"""

from .models import Order


def get_user_orders(user):
    return Order.objects.filter(user=user).order_by('-created')


def get_order_details(order_uuid):
    # Query by uuid field
    return Order.objects.prefetch_related('order_items__product').get(uuid=order_uuid)

# def get_order_details(order_id):
#     return Order.objects.prefetch_related('order_items__product').get(id=order_id)
