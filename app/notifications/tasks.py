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
