# from django.db import models
# from django.conf import settings
# from core.models import (
#     UUIDModel,
#     TimeStampedModel
# )
#
#
# class Notification(UUIDModel, TimeStampedModel):
#     """
#     A model representing notifications sent to users.
#     """
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
#     subject = models.CharField(max_length=255)
#     message = models.TextField()
#     sent = models.BooleanField(default=False)
#     notification_type = models.CharField(max_length=50)
#
#     def __str__(self):
#         return f"Notification to {self.user.email}: {self.subject}"
