# from django.db import models
# from order.models import Order
#
#
# class Payment(models.Model):
#     PENDING = 'pending'
#     COMPLETED = 'completed'
#     FAILED = 'failed'
#     STATUS_CHOICES = [
#         (PENDING, 'Pending'),
#         (COMPLETED, 'Completed'),
#         (FAILED, 'Failed'),
#     ]
#
#     order = models.OneToOneField(Order, on_delete=models.CASCADE)
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)
#     transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#
#     def __str__(self):
#         return f"Payment for Order {self.order.id} - {self.status}"
