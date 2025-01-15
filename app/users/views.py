"""
Views for the User API.
"""

from rest_framework import generics, permissions
from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication


from core.exceptions import UserProfileNotFoundException

from .serializers import (
    CustomUserSerializer,
    CustomUserSerializerWithToken,
    CustomerProfileSerializer,
    ChangePasswordSerializer,
)

from .permissions import IsOwner
from .models import CustomerProfile


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        serializer = CustomUserSerializerWithToken(self.user).data
        for k, v in serializer.items():
            data[k] = v

        return data


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class RegisterUserView(generics.CreateAPIView):
    """Register a new user in the system."""
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.AllowAny]


class ManageUserView(generics.RetrieveUpdateAPIView):
    """
    GET, PUT, PATCH:
    Manage the authenticated user. (user-facing)
    """
    serializer_class = CustomUserSerializer
    authentication_classes = [JWTAuthentication]
    # No need of IsOwner permission / obj permission /
    # already pointing to the owner's own user.
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """Retrieve and return the authenticated user"""
        return self.request.user


# class ManageCustomerProfileView(generics.RetrieveUpdateAPIView):
#     """
#     GET, PUT, PATCH:
#     Manage the own profile of the authenticated customer.(user-facing)
#     """
#     serializer_class = CustomerProfileSerializer
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [permissions.IsAuthenticated, IsOwner]
#
#     def get_object(self):
#         """Retrieve and return the authenticated customer."""
#         return self.request.user.customer_profile


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
        try:
            return CustomerProfile.objects.get(uuid=profile_uuid)
        except CustomerProfile.DoesNotExist:
            raise UserProfileNotFoundException("Customer profile not found.")


class ChangePasswordView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']

        if not user.check_password(old_password):
            return Response(
                {"error": "Old password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()
        return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)
