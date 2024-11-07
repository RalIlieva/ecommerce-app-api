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
    The email is based on the details in the `Notification` model.

    Workflow:
        - Retrieve the `Notification` object using the provided UUID.
        - Send an email using Django's `send_mail` utility.
        - Update the `status` of `Notification` to `True` if the email is sent.

    Exceptions:
        - Logs error if the `Notification` instance does not exist.
        - Logs error for any other exceptions that occur during email sending.

    Notes:
        - Uses Celery for asynchronous email sending, allowing order creation
          process to remain non-blocking.
        - Emails are sent using the SMTP configuration in Django settings.
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

        # # Retry the task in case of a temporary failure
        # raise self.retry(exc=e, countdown=60)
