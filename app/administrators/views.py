"""
The custom api administrtor views.
"""

from rest_framework import mixins, viewsets, permissions
from users.models import CustomerProfile
from users.serializers import CustomerProfileSerializer


class AdministratorCustomerProfileViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet
):
    """Administrator viewset for managing customer profiles."""
    queryset = CustomerProfile.objects.all()
    serializer_class = CustomerProfileSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
