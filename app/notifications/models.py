from django.db import models
from django.conf import settings
from core.models import (
    UUIDModel,
    TimeStampedModel
)


class Notification(UUIDModel, TimeStampedModel):
    EMAIL = 'email'
    # TODO
    # IN_APP = 'in_app'
    # SMS = 'sms'

    NOTIFICATION_TYPES = [
        (EMAIL, 'Email'),
        # TODO
        # (IN_APP, 'In-App'),
        # (SMS, 'SMS'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='notifications',
        on_delete=models.CASCADE
    )
    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        default=EMAIL
    )
    subject = models.CharField(max_length=255)
    body = models.TextField()
    # False = Not Sent, True = Sent
    status = models.BooleanField(default=False)

    def __str__(self):
        return f"Notification for {self.user.email} - {self.notification_type} - {self.subject}"
