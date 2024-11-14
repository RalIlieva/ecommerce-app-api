from rest_framework import permissions


class IsVendor(permissions.BasePermission):
    """Custom permission for vendors."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.groups.filter(
            name='vendor'
        ).exists())
