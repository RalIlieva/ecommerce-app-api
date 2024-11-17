# vendor/views/orders/vendor_order_views.py

from drf_spectacular.utils import extend_schema
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import (
    generics,
    permissions,
    status
)
# from rest_framework.permissions import IsAdminUser
from core.permissions import IsVendor
from order.serializers import OrderSerializer
from order.models import Order


@extend_schema(
    description="Retrieve a list of all orders (vendor access only).",
    responses={200: OrderSerializer(many=True)}
)
class VendorOrderListView(generics.ListAPIView):
    """
    API view for vendor users to retrieve a list of all orders.
    """
    queryset = Order.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsVendor]
    serializer_class = OrderSerializer


class VendorOrderDetailView(generics.RetrieveAPIView):
    """
    Vendor View to retrieve or update an order.
    Only accessible to vendor users.
    """
    permission_classes = [permissions.IsAuthenticated, IsVendor]
    serializer_class = OrderSerializer
    queryset = Order.objects.all()
    lookup_field = 'uuid'
    lookup_url_kwarg = 'order_uuid'

    # def partial_update(self, request, *args, **kwargs):
    #     """Handle PATCH requests to update the order status."""
    #     order = get_object_or_404(Order, uuid=kwargs.get('order_uuid'))
    #     new_status = request.data.get('status')
    #
    #     if new_status not in [choice[0] for choice in Order.STATUS_CHOICES]:
    #         return Response(
    #             {"detail": "Invalid status."},
    #             status=status.HTTP_400_BAD_REQUEST
    #         )
    #
    #     order.status = new_status
    #     order.save()
    #     serializer = self.get_serializer(order)
    #     return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    description="Update the status of an order related to vendor products."
)
class VendorOrderStatusUpdateView(generics.UpdateAPIView):
    """
    API view to update the status of an order by the vendor.
    """
    permission_classes = [permissions.IsAuthenticated, IsVendor]
    serializer_class = OrderSerializer
    lookup_field = 'uuid'
    lookup_url_kwarg = 'order_uuid'

    # def get_queryset(self):
    #     vendor = self.request.user
    #     return Order.objects.filter(product__vendor=vendor).distinct()

    def patch(self, request, *args, **kwargs):
        """
        Handle PATCH requests to update the order status by the vendor.
        """
        order = get_object_or_404(Order, uuid=kwargs.get('order_uuid'))
        # order = self.get_object()
        new_status = request.data.get('status')

        if new_status not in [choice[0] for choice in Order.STATUS_CHOICES]:
            return Response(
                {"detail": "Invalid status."},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = new_status
        order.save()
        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
