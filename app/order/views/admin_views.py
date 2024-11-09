from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import (
    generics,
    permissions,
    status
)
from rest_framework.permissions import IsAdminUser
from drf_spectacular.utils import extend_schema
from order.serializers import OrderSerializer
from order.models import Order


@extend_schema(
    description="Retrieve a list of all orders (admin access only).",
    responses={200: OrderSerializer(many=True)}
)
class AdminOrderListView(generics.ListAPIView):
    """
    API view for admin users to retrieve a list of all orders.
    """
    queryset = Order.objects.all()
    permission_classes = [IsAdminUser]
    serializer_class = OrderSerializer


class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    """
    Admin View to retrieve or update an order.
    Only accessible to admin users.
    """
    permission_classes = [permissions.IsAdminUser]
    serializer_class = OrderSerializer
    queryset = Order.objects.all()
    lookup_field = 'uuid'
    lookup_url_kwarg = 'order_uuid'

    def partial_update(self, request, *args, **kwargs):
        """Handle PATCH requests to update the order status."""
        order = get_object_or_404(Order, uuid=kwargs.get('order_uuid'))
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

    # def patch(self, request, *args, **kwargs):
    #     """Patch method to update the order status."""
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
