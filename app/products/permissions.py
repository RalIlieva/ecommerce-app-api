"""
Custom permissions.
"""

from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit or delete it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the review.
        return obj.user == request.user
