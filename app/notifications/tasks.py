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
        logger.error(
            f"Notification with UUID {notification_uuid} does not exist."
        )
    except Exception as e:
        logger.error(
            f"Failed to send email for notification\
            {notification_uuid}: {str(e)}"
        )
