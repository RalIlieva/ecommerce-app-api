from django.db import models
from django.conf import settings
from core.models import UUIDModel, TimeStampedModel
from order.models import Order


class Payment(UUIDModel, TimeStampedModel):
    PENDING = 'pending'
    SUCCESS = 'success'
    FAILED = 'failed'
    PAYMENT_STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (SUCCESS, 'Success'),
        (FAILED, 'Failed'),
    ]

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name='payment'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    amount = models.DecimalField(
        max_digits=10, decimal_places=2
    )
    status = models.CharField(
        max_length=10, choices=PAYMENT_STATUS_CHOICES, default=PENDING
    )
    stripe_payment_intent_id = models.CharField(
        max_length=255, blank=True, null=True
    )

    def __str__(self):
        # Using internal 'id' for a human-readable, easy-to-read output
        return f"Payment for Order {self.order.id} - Status: {self.status}"

    # Internal utility function for debugging, to show both uuid and id
    def debug_info(self):
        return f"Payment UUID: {self.uuid}, " \
               f"Payment ID: {self.id}, Order ID: {self.order.id}"
