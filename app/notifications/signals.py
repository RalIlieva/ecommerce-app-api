# notifications/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from order.models import Order
from notifications.services import handle_order_creation_notification
# from notifications.tasks import send_order_confirmation_email


@receiver(post_save, sender=Order)
def send_order_confirmation(sender, instance, created, **kwargs):
    if created:
        # Call a service to handle the notification logic
        handle_order_creation_notification(instance)

        # # Send email confirmation using Celery task
        # send_order_confirmation_email.delay(instance.id, instance.user.email)
