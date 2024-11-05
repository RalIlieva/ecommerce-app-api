# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from order.models import Order
# from notifications.tasks import send_notification_task
#
# @receiver(post_save, sender=Order)
# def send_order_notification(sender, instance, created, **kwargs):
#     if created:
#         # Order is created, send a notification
#         send_notification_task.delay(instance.user.email, instance.id)
