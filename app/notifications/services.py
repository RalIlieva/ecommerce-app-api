"""
Business logic - functions - write to db.
"""
from django.db import transaction
from notifications.models import Notification
from notifications.tasks import send_order_confirmation_email


@transaction.atomic
def handle_order_creation_notification(order):
    """
    Handles the creation of a notification when an order is created.
    Creates the notification in the database and then sends the email.
    """
    # Create the notification record in the database
    notification = Notification.objects.create(
        user=order.user,
        notification_type=Notification.EMAIL,
        subject=f"Order Confirmation #{order.uuid}",
        body=f"Your order with ID #{order.uuid} has been successfully placed!",
        status=False  # Not sent initially
    )

    # The notification is saved before triggering the Celery task
    notification.save()

    # Call Celery task to send the email
    send_order_confirmation_email.delay(notification.uuid)
