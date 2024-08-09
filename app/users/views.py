"""
Views for the User API.
"""

from rest_framework import generics, permissions, mixins, viewsets

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication


from .serializers import (
    UserSerializer,
    UserSerializerWithToken,
    CustomerProfileSerializer,
)

from .permissions import IsOwner


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
    """Manage the authenticated user."""
    serializer_class = UserSerializer
    authentication_classes = [JWTAuthentication]

    def get_object(self):
        """Retrieve and return the authenticated user"""
        return self.request.user


class ManageCustomerProfileView(generics.RetrieveUpdateAPIView):
    """Manage the profile of the authenticated customer."""
    serializer_class = CustomerProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_object(self):
        """Retrieve and return the authenticated customer."""
        return self.request.user.customer_profile
