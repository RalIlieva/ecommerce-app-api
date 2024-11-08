from rest_framework import generics
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
    API view for admins to retrieve and update specific order details.
    Admins can update order statuses like 'SHIPPED' or 'CANCELLED'.
    """
    permission_classes = [IsAdminUser]
    serializer_class = OrderSerializer
    queryset = Order.objects.all()
    lookup_field = 'uuid'
