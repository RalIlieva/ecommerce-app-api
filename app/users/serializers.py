"""
Serializers for the user API View.
"""

from django.contrib.auth import get_user_model
# from django.utils.translation import gettext as _

from rest_framework import serializers

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CustomerProfile


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        data['email'] = self.user.email
        data['name'] = self.user.name
        data['uuid'] = str(self.user.uuid)

        return data


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the user object."""
    id = serializers.ReadOnlyField()
    uuid = serializers.UUIDField(read_only=True)
    # user_uuid = serializers.UUIDField(read_only=True)

    class Meta:
        model = get_user_model()
        fields = ['id', 'uuid', 'email', 'password', 'name']
        extra_kwargs = {'password': {'write_only': True, 'min_length': 5}}

    def create(self, validated_data):
        """Create and return a user with encrypted password."""
        return get_user_model().objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        """Update and return a user."""
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)

        if password:
            user.set_password(password)
            user.save()

        return user


class UserSerializerWithToken(UserSerializer):
    """Serializer for users with tokens for authentication """
    token = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = get_user_model()
        fields = ['id', 'uuid', 'email', 'password', 'name', 'token']
        read_only_fields = ['id', 'uuid', 'token']

    def get_token(self, obj):
        token = RefreshToken.for_user(obj)
        return str(token.access_token)


class CustomerProfileSerializer(serializers.ModelSerializer):
    """Serializer for the profile of the customer."""
    user = UserSerializer(read_only=True)
    profile_uuid = serializers.UUIDField(source='uuid', read_only=True)

    class Meta:
        model = CustomerProfile
        fields = [
            'id',
            'profile_uuid',
            # 'uuid',
            'user',
            'gender',
            'phone_number',
            'address',
            'date_of_birth',
            'about'
        ]
        read_only_fields = ['id', 'profile_uuid', 'user']


class UserReviewSerializer(serializers.ModelSerializer):
    """Serializer for embedding user data in reviews."""
    uuid = serializers.UUIDField(
        source='customer_profile.uuid',
        read_only=True
    )
    name = serializers.SerializerMethodField()

    class Meta:
        # model = CustomerProfile
        model = get_user_model()
        fields = ['uuid', 'name']
        read_only_fields = ['uuid', 'name']

    def get_name(self, obj):
        """Return the user's name, or email prefix if name is missing."""
        name = obj.name
        if not name:
            name = obj.email.split('@')[0]
        return name
