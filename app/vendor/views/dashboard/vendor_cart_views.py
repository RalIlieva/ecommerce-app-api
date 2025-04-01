# vendor/views/cart.py
from django.db.models import Sum, Count
from rest_framework.views import APIView
from rest_framework import generics, permissions
from rest_framework.response import Response
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


class VendorCartAggregationView(APIView):
    """
    Return aggregated cart data, grouped by product.
    """
    permission_classes = [permissions.IsAuthenticated, IsVendor]

    def get(self, request, *args, **kwargs):
        aggregated_cart = CartItem.objects.values(
            'product__id', 'product__name'
        ).annotate(
            total_quantity=Sum('quantity'),
            item_count=Count('id')
        )
        return Response(aggregated_cart)
