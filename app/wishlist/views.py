"""
Views for wishlist app.
"""

from drf_spectacular.utils import (
    extend_schema_view,
    extend_schema,
    OpenApiParameter,
    OpenApiTypes
)
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import WishlistSerializer, WishlistItemSerializer
from .services import (
    get_or_create_wishlist,
    add_product_to_wishlist,
    remove_product_from_wishlist,
    move_wishlist_item_to_cart
)


@extend_schema_view(
    get=extend_schema(
        summary="Retrieve User's Wishlist",
        description="Retrieve the current user's wishlist. "
                    "Creates a new wishlist if one does not exist.",
        responses={200: WishlistSerializer}
    )
)
class WishlistView(generics.RetrieveAPIView):
    """
    Retrieve the current user's wishlist.

    This view retrieves the wishlist of the authenticated user.
    If no wishlist exists for the user, a new one is created.

    * Requires user to be authenticated.
    * Returns serialized wishlist data.

    Returns:
        Response: Serialized data of the user's wishlist.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = WishlistSerializer

    def get_object(self):
        return get_or_create_wishlist(self.request.user)


@extend_schema_view(
    post=extend_schema(
        summary="Add Product to Wishlist",
        description="Add a product to the authenticated user's wishlist "
                    "by providing the product UUID.",
        request=WishlistItemSerializer,
        parameters=[
            OpenApiParameter(
                name='product_uuid',
                type=OpenApiTypes.UUID,
                required=True,
                location='body',
                description="The UUID of the product to add to the wishlist."
            )
        ],
        responses={201: WishlistItemSerializer,
                   400: OpenApiTypes.STR
                   # 400: "Product already in wishlist.",
                   }
    )
)
class AddToWishlistView(generics.CreateAPIView):
    """
    Add a product to the user's wishlist.
    This view allows an authenticated user to add a specified product
    to their wishlist.
    * Requires user to be authenticated.
    * Expects a 'product_uuid' in the request data.
    Returns:
        Response: A confirmation message with HTTP 201 status.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = WishlistItemSerializer

    def create(self, request, *args, **kwargs):
        product_uuid = request.data.get('product_uuid')
        add_product_to_wishlist(request.user, product_uuid)
        return Response(
            {'detail': 'Product added to wishlist.'},
            status=status.HTTP_201_CREATED
        )


@extend_schema_view(
    delete=extend_schema(
        summary="Remove Product from Wishlist",
        description="Remove a product from the authenticated user's wishlist "
                    "by providing the product UUID in the URL.",
        parameters=[
            OpenApiParameter(
                name='product_uuid',
                type=OpenApiTypes.UUID,
                required=True,
                location='path',
                description="The UUID of the product to remove "
                            "from the wishlist."
            )
        ],
        responses={
            204: OpenApiTypes.STR,  # Product successfully removed
            404: OpenApiTypes.STR  # Product not found in wishlist
            # 204: "Product removed from wishlist.",
            # 404: "Product not found in wishlist."
        }
    )
)
class RemoveFromWishlistView(generics.DestroyAPIView):
    """
    Remove a product from the user's wishlist.
    This view allows an authenticated user to remove a specific product
    from their wishlist by providing the product's UUID in the URL.
    * Requires user to be authenticated.
    * Expects 'product_uuid' in URL parameters.

    Returns:
        Response: A confirmation message with HTTP 204 status.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = WishlistItemSerializer

    def delete(self, request, *args, **kwargs):
        product_uuid = kwargs.get('product_uuid')
        remove_product_from_wishlist(request.user, product_uuid)
        return Response(
            {'detail': 'Product removed from wishlist.'},
            status=status.HTTP_204_NO_CONTENT
        )


@extend_schema_view(
    post=extend_schema(
        summary="Move Product from Wishlist to Cart",
        description="Move a product from the wishlist to "
                    "the cart for the authenticated user.",
        request=WishlistItemSerializer,
        parameters=[
            OpenApiParameter(
                name='product_uuid',
                type=OpenApiTypes.UUID,
                required=True,
                location='body',
                description="The UUID of the product to move to the cart."
            )
        ],
        responses={
            200: OpenApiTypes.STR,  # Product successfully moved to cart
            404: OpenApiTypes.STR   # Product not found or insufficient stock
            # 200: "Product moved to cart.",
            # 404: "Product not found"
            #             " in wishlist or insufficient stock."
        }
    )
)
class MoveToCartView(generics.CreateAPIView):
    """
    Move a product from the wishlist to the cart.
    This view allows an authenticated user to move a specified product
    from their wishlist to the shopping cart.
    * Requires user to be authenticated.
    * Expects 'product_uuid' in the request data.
    Returns:
        Response: A confirmation message with HTTP 200 status.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = WishlistItemSerializer

    def post(self, request, *args, **kwargs):
        product_uuid = request.data.get('product_uuid')
        move_wishlist_item_to_cart(request.user, product_uuid)
        return Response(
            {'detail': 'Product moved to cart.'},
            status=status.HTTP_200_OK
        )
