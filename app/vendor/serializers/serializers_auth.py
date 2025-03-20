# vendor/serializers.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers


class VendorTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom TokenObtainPairSerializer that checks whether the user is in
    the 'vendor' group and returns user info
    (including groups) in the token response.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        # Check if user is in the vendor group
        if not user.groups.filter(name='vendor').exists():
            raise serializers.ValidationError(
                {"detail": "You are not authorized as a vendor."}
            )

        # Include groups for use in the frontend if needed
        data['user'] = {
            "id": str(user.id),
            "email": user.email,
            "groups": [group.name for group in user.groups.all()]
        }
        return data
