"""
The custom api administrator views.
"""

from django.contrib.auth import get_user_model

from rest_framework import mixins, viewsets, permissions
from users.models import CustomerProfile
from users.serializers import (
    UserSerializer,
    CustomerProfileSerializer
)


class AdministratorUserViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet
):
    """Administrator viewset for managing users."""
    queryset = get_user_model().objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


class AdministratorCustomerProfileViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet
):
    """Administrator viewset for managing customer profiles."""
    queryset = CustomerProfile.objects.all().order_by('id')
    serializer_class = CustomerProfileSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
