# notifications/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from order.models import Order
from notifications.services import handle_order_creation_notification


@receiver(post_save, sender=Order)
def send_order_confirmation(sender, instance, created, **kwargs):
    """
    Signal handler for sending order confirmation notifications.
    This signal is triggered when a new `Order` object is created.
    If the order is successfully created, it calls the notification service
    to handle creating and sending an order confirmation email to the user.

    Args:
        sender (Model): The model class that sent the signal (`Order`).
        instance (Order): The instance of the order that was saved.
        created (bool): A boolean indicating if the instance was created.
        `True` if a new record was created, `False` if an existing
         record was updated.
        """
    if created:
        # Call a service to handle the notification logic
        handle_order_creation_notification(instance)
