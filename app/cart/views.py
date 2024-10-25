from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import CartSerializer, CartItemSerializer
from .services import (
    add_item_to_cart,
    update_cart_item,
    remove_item_from_cart,
    get_or_create_cart
)
from .models import (
    CartItem
)


class CartDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CartSerializer

    def get_object(self):
        return get_or_create_cart(self.request.user)


class AddCartItemView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CartItemSerializer

    def post(self, request, *args, **kwargs):
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        cart_item = add_item_to_cart(request.user, product_id, quantity)
        serializer = self.get_serializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UpdateCartItemView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CartItemSerializer
    lookup_field = 'uuid'  # Use UUID for detail view lookup

    def patch(self, request, *args, **kwargs):
        cart_item_uuid = kwargs['uuid']  # Update to use UUID
        quantity = request.data.get('quantity')
        cart_item = update_cart_item(request.user, cart_item_uuid, quantity)
        serializer = self.get_serializer(cart_item)
        return Response(serializer.data)


class RemoveCartItemView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'  # Use UUID for detail view lookup

    def delete(self, request, *args, **kwargs):
        cart_item_uuid = kwargs['uuid']  # Update to use UUID
        remove_item_from_cart(request.user, cart_item_uuid)
        return Response(status=status.HTTP_204_NO_CONTENT)
