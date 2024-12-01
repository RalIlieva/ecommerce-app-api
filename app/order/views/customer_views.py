from drf_spectacular.utils import (
    extend_schema_view,
    extend_schema,
    OpenApiParameter,
    OpenApiTypes
)
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework import generics, status, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from order.models import Order
from order.serializers import OrderSerializer
from order.services import (
    create_order,
    update_order_status
)
from order.selectors import (
    get_order_details,
    get_user_orders
)


@extend_schema_view(
    list=extend_schema(
        parameters=[
            OpenApiParameter(
                'status',
                OpenApiTypes.STR,
                enum=['pending', 'paid', 'shipped', 'cancelled'],
                description='Filter orders by their current status.'
            )
        ],
        description="Retrieve a list of orders for the authenticated user. "
                    "Filter orders by status "
                    "(pending, paid, shipped, cancelled)."
    )
)
class OrderListView(generics.ListAPIView):
    """
    API view to retrieve a list of orders for the authenticated user.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        # Retrieve orders specific to the authenticated user
        return get_user_orders(self.request.user)


@extend_schema_view(
    create=extend_schema(
        description="Create a new order for authenticated users.",
        responses={201: OrderSerializer}
    )
)
class OrderCreateView(generics.CreateAPIView):
    """
    API view to create a new order for the authenticated user.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def create(self, request, *args, **kwargs):
        order_data = request.data.get('items', [])
        order = create_order(request.user, order_data)
        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@extend_schema_view(
    retrieve=extend_schema(
        description="Retrieve a specific order using its UUID."
    )
)
class OrderDetailView(generics.RetrieveAPIView):
    """
    API view to retrieve an order for the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_object(self):
        # Retrieve the order based on the provided UUID
        order_uuid = self.kwargs.get('order_uuid')
        # Use get_object_or_404 to get the order or
        # return a 404 error if not found
        order = get_object_or_404(Order, uuid=order_uuid)

        # Check if the authenticated user is the owner of the order
        if order.user != self.request.user:
            # If the authenticated user is not the owner of the order,
            # raise a 403
            self.permission_denied(
                self.request,
                message="You do not have permission to access this order.",
                code=status.HTTP_403_FORBIDDEN
            )

        # If permission is granted, return the order
        return order

    def get(self, request, *args, **kwargs):
        # Call the parent get method which uses get_object
        order = self.get_object()
        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    description="Allow a customer to cancel "
                "a pending or paid order that has not been shipped.",
    responses={204: 'Order canceled successfully', 400: 'Cannot cancel order'}
)
class OrderCancelView(APIView):
    """
    API view for customers to cancel a pending or paid order.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, order_uuid, *args, **kwargs):
        order = get_order_details(order_uuid)
        if order.user != request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        if order.status not in [Order.PENDING, Order.PAID]:
            return Response(
                {"detail": "Only pending or paid orders can be canceled."},
                status=status.HTTP_400_BAD_REQUEST
            )
        update_order_status(order, Order.CANCELLED)
        return Response(status=status.HTTP_204_NO_CONTENT)
