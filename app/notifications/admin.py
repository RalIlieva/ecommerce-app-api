""""
Register notification models.
"""

from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'notification_type', 'subject', 'status', 'created', 'modified'
    ]
    list_filter = ['notification_type', 'status', 'created']
    search_fields = ['user__email', 'subject']
    ordering = ['-created']
