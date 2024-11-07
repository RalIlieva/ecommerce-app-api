"""
Notification serializers.
"""

from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'uuid', 'user',
            'notification_type', 'subject', 'body', 'status',
            'created', 'modified'
        ]
        read_only_fields = ['uuid', 'user', 'created', 'modified']
