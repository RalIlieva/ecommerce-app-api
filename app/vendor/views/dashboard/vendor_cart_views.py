# vendor/views/cart.py

from rest_framework import generics, permissions
from core.permissions import IsVendor
from cart.models import CartItem
from cart.serializers import CartItemSerializer


class VendorCartInfoView(generics.ListAPIView):
    """
    View cart details for vendor products.
    """
    permission_classes = [permissions.IsAuthenticated, IsVendor]
    serializer_class = CartItemSerializer

    def get_queryset(self):
        # Return all cart items for the single vendor
        return CartItem.objects.all()
