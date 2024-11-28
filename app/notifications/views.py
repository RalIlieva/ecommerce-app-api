"""
Views for notification app.
"""
from drf_spectacular.utils import (
    extend_schema_view,
    extend_schema,
    OpenApiParameter,
    OpenApiTypes
)
from rest_framework.exceptions import NotFound
from rest_framework import generics, permissions
from .models import Notification
from .serializers import NotificationSerializer


@extend_schema_view(
    get=extend_schema(
        summary="Retrieve Notifications for User",
        description="Retrieve a list of all notifications for "
                    "the authenticated user.",
        tags=["Notifications"],
        responses={200: NotificationSerializer(many=True)},
    )
)
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


@extend_schema_view(
    get=extend_schema(
        summary="Retrieve Notification by UUID",
        description="Retrieve a specific notification by UUID "
                    "for the authenticated user.",
        tags=["Notifications"],
        parameters=[
            OpenApiParameter(
                name='uuid',
                type=OpenApiTypes.UUID,
                location='path',
                description="UUID of the notification to retrieve"
            )
        ],
        responses={200: NotificationSerializer},
    )
)
class NotificationDetailView(generics.RetrieveAPIView):
    """
    View to retrieve a specific notification by UUID.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'uuid'

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def get_object(self):
        queryset = self.get_queryset()
        obj = queryset.get(uuid=self.kwargs.get(self.lookup_field))
        return obj

        # try:
        #     obj = queryset.get(uuid=self.kwargs.get(self.lookup_field))
        # except Notification.DoesNotExist:
        #     raise NotFound('Notification not found.')
        # return obj
