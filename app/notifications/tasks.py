# notifications/tasks.py

from celery import shared_task
from django.core.mail import send_mail
from .models import Notification
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


@shared_task
def send_order_confirmation_email(notification_uuid):
    """
    Task to send an order confirmation email.
    """
    try:
        # Get the notification by UUID
        notification = Notification.objects.get(uuid=notification_uuid)

        # Attempt to send the email
        send_mail(
            subject=notification.subject,
            message=notification.body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[notification.user.email],
            fail_silently=False
        )

        # If email is sent successfully, update the notification status
        notification.status = True
        notification.save()

    except Notification.DoesNotExist:
        logger.error(f"Notification with UUID {notification_uuid} does not exist.")
    except Exception as e:
        logger.error(f"Failed to send email for notification {notification_uuid}: {str(e)}")

# @shared_task
# def send_order_confirmation_email(order_uuid, user_email):
#     """
#     Task to create a notification and send an order confirmation email.
#     """
#     # Create the Notification in the database
#     subject = f"Order Confirmation #{order_uuid}"
#     body = f"Your order with ID #{order_uuid} has been successfully placed!"
#
#     notification = Notification.objects.create(
#         user=user_email,  # Assuming user_email is actually user instance
#         notification_type=Notification.EMAIL,
#         subject=subject,
#         body=body,
#         status=False  # Not sent initially
#     )
#
#     # Attempt to send the email
#     try:
#         send_mail(
#             subject=subject,
#             message=body,
#             from_email=settings.DEFAULT_FROM_EMAIL,
#             recipient_list=[user_email],
#             fail_silently=False
#         )
#         # If email is sent successfully, update the notification status
#         notification.status = True
#         notification.save()
#     except Exception as e:
#         # If the email fails, it will automatically retry based on Celery's configuration
#         print(f"Failed to send email: {str(e)}")

# Previous versions
# from celery import shared_task
# from django.core.mail import send_mail
# from notifications.models import Notification
# from django.conf import settings
#
#
# @shared_task
# def send_email_notification(notification_id):
#     """
#     Task to send an email notification.
#     """
#     try:
#         notification = Notification.objects.get(pk=notification_id)
#         send_mail(
#             notification.subject,
#             notification.message,
#             settings.DEFAULT_FROM_EMAIL,
#             [notification.user.email],
#         )
#         notification.sent = True
#         notification.save()
#     except Notification.DoesNotExist:
#         pass


# from celery import shared_task
# from django.core.mail import send_mail
#
#
# @shared_task
# def send_notification_task(recipient_email, order_id):
#     subject = f"Your Order {order_id} is Confirmed"
#     message = f"Thank you for your order {order_id}. We are preparing it for shipment!"
#     send_mail(subject, message, 'noreply@myshop.com', [recipient_email])
