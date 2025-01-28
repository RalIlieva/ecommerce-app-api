"""
Business logic - functions - write to db.
"""

from django.db import transaction
from django.contrib.auth import get_user_model
from notifications.models import Notification
from notifications.tasks import send_order_confirmation_email


@transaction.atomic
def handle_order_creation_notification(order):
    """
    Creates two notifications (for the user and for the vendor)
    and schedules emails via Celery after the transaction commits.
    """

    # 1) Create user notification
    notification = Notification.objects.create(
        user=order.user,
        notification_type=Notification.EMAIL,
        subject=f"Order Confirmation #{order.uuid}",
        body=f"Your order with ID #{order.uuid} has been successfully placed!",
        status=False
    )
    # Schedule Celery task *after* this transaction is committed
    transaction.on_commit(
        lambda: send_order_confirmation_email.delay(notification.uuid)
    )

    # 2) Attempt vendor notification
    from django.conf import settings
    try:
        vendor_user = get_user_model().objects.get(email=settings.VENDOR_EMAIL)
    except get_user_model().DoesNotExist:
        print(f"Vendor user with email {settings.VENDOR_EMAIL} does not exist.")
        return  # So we never create a vendor notification
    else:
        # Only create vendor notification if user is found
        vendor_notification = Notification.objects.create(
            user=vendor_user,
            notification_type=Notification.EMAIL,
            subject=f"New Order Received #{order.uuid}",
            body=f"A new order with ID #{order.uuid} has been placed.",
            status=False
        )
        # Same pattern: schedule the Celery task after commit
        transaction.on_commit(
            lambda: send_order_confirmation_email.delay(vendor_notification.uuid)
        )

# Initial version - with delay
# from django.db import transaction
# from django.conf import settings
# from django.contrib.auth import get_user_model
# from notifications.models import Notification
# from notifications.tasks import send_order_confirmation_email
#
#
# @transaction.atomic
# def handle_order_creation_notification(order):
#     """
#     Handles the creation of a notification when an order is created.
#     Creates the notification in the database and then sends the email.
#     """
#     # Create the notification record in the database
#     notification = Notification.objects.create(
#         user=order.user,
#         notification_type=Notification.EMAIL,
#         subject=f"Order Confirmation #{order.uuid}",
#         body=f"Your order with ID #{order.uuid}
#         has been successfully placed!",
#         status=False  # Not sent initially
#     )
#
#     # The notification is saved before triggering the Celery task
#     notification.save()
#
#     # Call Celery task to send the email
#     send_order_confirmation_email.delay(notification.uuid)
#
#     # Notify the vendor about the new order
#     try:
#         vendor_user = get_user_model().objects.get(
#         email=settings.VENDOR_EMAIL
#         )
#     except get_user_model().DoesNotExist:
#         # In case the vendor user is not found
#         print(
#             f"Vendor user with email {settings.VENDOR_EMAIL} does not exist."
#         )
#         return
#
#     vendor_notification = Notification.objects.create(
#         user=vendor_user,
#         notification_type=Notification.EMAIL,
#         subject=f"New Order Received #{order.uuid}",
#         body=f"A new order with ID #{order.uuid} has been placed.",
#         status=False  # Not sent initially
#     )
#     vendor_notification.save()
#
#     # Call Celery task to send the email to the vendor
#     send_order_confirmation_email.delay(vendor_notification.uuid)
