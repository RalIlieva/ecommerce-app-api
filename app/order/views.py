"""
Views for Order Api.
"""

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer
from .selectors import get_user_orders
from .services import (
    create_order,
    update_order_status
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


class OrderCreateView(generics.CreateAPIView):
    """
    API view to create a new order for the authenticated user.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def create(self, request, *args, **kwargs):
        # Extract order data from request and pass it to the service layer
        order_data = request.data.get('items', [])
        order = create_order(request.user, order_data)
        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveUpdateAPIView):
    """
    API view to retrieve or update an order for the authenticated user.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return get_user_orders(self.request.user)

    def update(self, request, *args, **kwargs):
        # Custom update logic if needed
        order = self.get_object()
        new_status = request.data.get('status')
        order = update_order_status(order, new_status)
        serializer = self.get_serializer(order)
        return Response(serializer.data)
