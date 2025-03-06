from celery import shared_task
from order.models import Order
from products.services import increase_product_stock
from datetime import timedelta
from django.utils import timezone
# from django.db import transaction


@shared_task
def cancel_expired_orders_task():
    """
    Cancel orders that are pending for more than 1 hour
    and restock the products.
    """
    expired_time = timezone.now() - timedelta(hours=1)
    expired_orders = Order.objects.filter(
        status=Order.PENDING,
        created__lt=expired_time
    )

    for order in expired_orders:
        # Restock the products before cancelling the order
        for item in order.order_items.all():
            # Increase stock for each product in the order
            increase_product_stock(item.product.uuid, item.quantity)

        # Mark the order as cancelled
        order.status = Order.CANCELLED
        order.save()
        print(
            f"Order {order.uuid} has been cancelled and stock updated."
        )
