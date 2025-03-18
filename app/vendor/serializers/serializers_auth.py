# vendor/serializers/serializers_auth.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class VendorTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom TokenObtainPairSerializer that checks whether the user is in the 'vendor' group.
    """

    def validate(self, attrs):
        # Let the base SimpleJWT serializer do its job:
        data = super().validate(attrs)

        # At this point, self.user is the authenticated user
        user = self.user

        # Check if user is in the vendor group
        if not user.groups.filter(name='vendor').exists():
            raise serializers.ValidationError(
                detail={"detail": "You are not authorized as a vendor."},
            )

        # Optionally, add user info to the response
        data['user'] = {
            "id": str(user.id),
            "email": user.email
        }

        return data
