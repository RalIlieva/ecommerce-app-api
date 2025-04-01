# vendor/views/wishlist.py
from django.db.models import Count
from rest_framework.views import APIView
from rest_framework import generics, permissions
from rest_framework.response import Response
from core.permissions import IsVendor
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


class VendorWishlistAggregationView(APIView):
    """
    Return aggregated wishlist data, grouped by product.
    """
    permission_classes = [permissions.IsAuthenticated, IsVendor]

    def get(self, request, *args, **kwargs):
        aggregated_wishlist = WishlistItem.objects.values(
            'product__id', 'product__name'
        ).annotate(
            wishlist_count=Count('id')
        )
        return Response(aggregated_wishlist)
