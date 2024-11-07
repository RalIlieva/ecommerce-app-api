# notifications/views.py
from rest_framework.exceptions import NotFound
from rest_framework import generics, permissions
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """
    View to list all notifications for the authenticated user.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter notifications to only belonging to the authenticated user
        user = self.request.user
        return Notification.objects.filter(user=user)


class NotificationDetailView(generics.RetrieveAPIView):
    """
    View to retrieve a specific notification by UUID.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def get_object(self):
        queryset = self.get_queryset()
        try:
            obj = queryset.get(uuid=self.kwargs.get(self.lookup_field))
        except Notification.DoesNotExist:
            raise NotFound('Notification not found.')
        return obj
