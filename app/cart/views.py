"""
Views for cart app.
"""
from drf_spectacular.utils import (
    extend_schema_view,
    extend_schema,
    OpenApiParameter,
    OpenApiTypes
)
from rest_framework.views import APIView
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


@extend_schema_view(
    get=extend_schema(
        summary="Retrieve User's Cart",
        description="Retrieve all items in the authenticated user's cart.",
    )
)
class CartDetailView(generics.RetrieveAPIView):
    """
    Retrieve the details of the authenticated user's cart.
    Returns the cart & all associated items for the authenticated user.
    If the user does not already have a cart, a new one is created.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CartSerializer

    def get_object(self):
        """
        Retrieve or create a cart for the authenticated user.
        Returns:
        Cart instance for the authenticated user.
         """
        return get_or_create_cart(self.request.user)


@extend_schema_view(
    post=extend_schema(
        summary="Add Item to Cart",
        description="Add a product to the authenticated user's cart by providing "
                    "the product ID and an optional quantity.",
        parameters=[
            OpenApiParameter(
                name='product_id',
                type=OpenApiTypes.UUID,
                required=True,
                location='query',
                description="The UUID of the product to add to the cart."
            ),
            OpenApiParameter(
                name='quantity',
                type=OpenApiTypes.INT,
                required=False,
                default=1,
                location='query',
                description="The quantity of the product to add (default is 1)."
            ),
        ],
        responses={201: CartItemSerializer}
    )
)
class AddCartItemView(generics.CreateAPIView):
    """
    Add a product to the authenticated user's cart.

    This view allows users to add a product to their cart by providing
    the product ID and an optional quantity. If the item already exists
    in the cart,the quantity will be updated.
    Serializer:
        - CartItemSerializer: Serializes the added cart item.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CartItemSerializer

    def post(self, request, *args, **kwargs):
        """
        Add a product to the cart with specified quantity.
        Args:
            request: HTTP request containing `product_id` and `quantity` data.
        Returns:
            HTTP 201 CREATED with serialized cart item data on success.
        """
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        cart_item = add_item_to_cart(request.user, product_id, quantity)
        serializer = self.get_serializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UpdateCartItemView(generics.UpdateAPIView):
    """
    Update the quantity of a specific item in the authenticated user's cart.
    This view allows users to update the quantity of a specific item
    in their cart by providing the item UUID and new quantity.
    Permissions:
            - Requires authentication.
    Serializer:
            - CartItemSerializer: Serializes the updated cart item.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CartItemSerializer
    lookup_field = 'uuid'  # Use UUID for detail view lookup

    def patch(self, request, *args, **kwargs):
        """
        Update the quantity of a cart item.
        Args:
            request: HTTP request containing new `quantity`.
            kwargs: URL parameters containing `uuid` of the cart item.
        Returns:
            HTTP 200 OK with serialized updated cart item data.
        """
        cart_item_uuid = kwargs['uuid']  # Update to use UUID
        quantity = request.data.get('quantity')
        cart_item = update_cart_item(request.user, cart_item_uuid, quantity)
        serializer = self.get_serializer(cart_item)
        return Response(serializer.data)


class RemoveCartItemView(generics.DestroyAPIView):
    """
    Remove a specific item from the authenticated user's cart.
    This view allows users to remove an item from
    their cart by providing the item UUID.
    """
    permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'  # Use UUID for detail view lookup

    def delete(self, request, *args, **kwargs):
        """
        Delete a cart item from the user's cart.
        Args:
            request: HTTP request.
            kwargs: URL params with `uuid` of the cart item to be removed.
        Returns:
            HTTP 204 NO CONTENT on successful deletion.
        """
        cart_item_uuid = kwargs['uuid']  # Update to use UUID
        remove_item_from_cart(request.user, cart_item_uuid)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ClearCartView(APIView):
    """
    Clear all items from the authenticated user's cart.
    This view allows users to remove all items from their cart at once.
    Permissions:
    - Requires authentication.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        """
        Delete all items from the user's cart.
        Args:
        request: HTTP request.
        Returns:
        HTTP 204 NO CONTENT on successful deletion of all cart items.
        """
        cart = get_or_create_cart(request.user)
        cart.items.all().delete()  # Clear all items from the user's cart
        return Response(status=status.HTTP_204_NO_CONTENT)
