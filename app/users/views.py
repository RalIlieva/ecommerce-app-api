"""
Views for the User API.
"""

from rest_framework import generics, permissions

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication


from core.exceptions import UserProfileNotFoundException

from .serializers import (
    UserSerializer,
    UserSerializerWithToken,
    CustomerProfileSerializer,
)

from .permissions import IsOwner
from .models import CustomerProfile


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        serializer = UserSerializerWithToken(self.user).data
        for k, v in serializer.items():
            data[k] = v

        return data


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class RegisterUserView(generics.CreateAPIView):
    """Register a new user in the system."""
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class ManageUserView(generics.RetrieveUpdateAPIView):
    """
    GET, PUT, PATCH:
    Manage the authenticated user. (user-facing)
    """
    serializer_class = UserSerializer
    authentication_classes = [JWTAuthentication]
    # No need of IsOwner permission / obj permission /
    # already pointing to the owner's own user.
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """Retrieve and return the authenticated user"""
        return self.request.user


class ManageCustomerProfileView(generics.RetrieveUpdateAPIView):
    """
    GET, PUT, PATCH:
    Manage the own profile of the authenticated customer.(user-facing)
    """
    serializer_class = CustomerProfileSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_object(self):
        """Retrieve and return the authenticated customer."""
        return self.request.user.customer_profile


class ManageCustomerProfileByUUIDView(generics.RetrieveUpdateAPIView):
    """
    GET, PUT, PATCH: Manage the customer profile by UUID.
    """
    serializer_class = CustomerProfileSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_object(self):
        """Retrieve and return the customer profile based on UUID."""
        profile_uuid = self.kwargs.get('profile_uuid')
        # return CustomerProfile.objects.get(uuid=profile_uuid)
        try:
            return CustomerProfile.objects.get(uuid=profile_uuid)
            # return self.request.user.customer_profile
        except CustomerProfile.DoesNotExist:
            raise UserProfileNotFoundException("Customer profile not found.")
