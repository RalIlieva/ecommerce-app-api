"""
Custom permissions for accessing the user and customer profile.
"""

from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """Custom permission to only allow owners of the profile to access it."""

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
