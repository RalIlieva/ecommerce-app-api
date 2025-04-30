# vendor/views/orders/vendor_order_views.py

from django.utils import timezone
from datetime import datetime
from drf_spectacular.utils import extend_schema
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import (
    generics,
    permissions,
    status
)
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
    queryset = Order.objects.all().order_by('-created')
    permission_classes = [permissions.IsAuthenticated, IsVendor]
    serializer_class = OrderSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        uuid = self.request.query_params.get('uuid')
        email = self.request.query_params.get('email')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if uuid:
            queryset = queryset.filter(uuid=uuid)
        if email:
            queryset = queryset.filter(user__email__icontains=email)

        if start_date:
            try:
                dt = datetime.fromisoformat(start_date)
                if timezone.is_naive(dt):
                    dt = timezone.make_aware(dt)
                queryset = queryset.filter(created__gte=dt)
            except ValueError:
                pass  # or handle invalid date format

        if end_date:
            try:
                dt = datetime.fromisoformat(end_date)
                if timezone.is_naive(dt):
                    dt = timezone.make_aware(dt)
                queryset = queryset.filter(created__lte=dt)
            except ValueError:
                pass

        return queryset


class VendorOrderDetailView(generics.RetrieveAPIView):
    """
    Vendor View to retrieve or update an order.
    Only accessible to vendor users.
    """
    permission_classes = [permissions.IsAuthenticated, IsVendor]
    serializer_class = OrderSerializer
    queryset = Order.objects.all().order_by('-created')
    lookup_field = 'uuid'
    lookup_url_kwarg = 'order_uuid'


@extend_schema(
    description="Update the status of an order related to vendor products."
)
class VendorOrderStatusUpdateView(generics.UpdateAPIView):
    """
    API view to update the status of an order by the vendor.
    """
    permission_classes = [permissions.IsAuthenticated, IsVendor]
    serializer_class = OrderSerializer
    queryset = Order.objects.all().order_by('-created')
    lookup_field = 'uuid'
    lookup_url_kwarg = 'order_uuid'

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
