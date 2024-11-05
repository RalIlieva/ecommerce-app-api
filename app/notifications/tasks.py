# from celery import shared_task
# from django.core.mail import send_mail
#
#
# @shared_task
# def send_notification_task(recipient_email, order_id):
#     subject = f"Your Order {order_id} is Confirmed"
#     message = f"Thank you for your order {order_id}. We are preparing it for shipment!"
#     send_mail(subject, message, 'noreply@myshop.com', [recipient_email])
