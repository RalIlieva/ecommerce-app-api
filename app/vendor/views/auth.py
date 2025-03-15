# vendor/views/auth.py
from django.contrib.auth import authenticate
from rest_framework import serializers, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()


# Serializer for Vendor Login
class VendorLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


# Vendor Login View
@api_view(['POST'])
def vendor_login(request):
    serializer = VendorLoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        # Authenticate the user
        user = authenticate(email=email, password=password)

        if user is None:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # Check if user is part of the "vendor" group
        if not user.groups.filter(name="vendor").exists():
            return Response({"detail": "You are not authorized as a vendor."}, status=status.HTTP_403_FORBIDDEN)

        # Vendor-specific logic: Return JWT
        # Generate a token using JWT
        # token = generate_jwt_token(user)
        # In this case, we are just returning the email for simplicity
        return Response({"detail": "Login successful", "user": {"email": user.email}}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
