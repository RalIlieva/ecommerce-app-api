# vendor/views/wishlist.py

from rest_framework import generics, permissions
from core.permission import IsVendor
from wishlist.models import WishlistItem
from wishlist.serializers import WishlistItemSerializer


class VendorWishlistView(generics.ListAPIView):
    """
    View wishlist details for vendor products.
    """
    permission_classes = [permissions.IsAuthenticated, IsVendor]
    serializer_class = WishlistItemSerializer

    def get_queryset(self):
        # Return all wishlist items for the single vendor
        return WishlistItem.objects.all()
