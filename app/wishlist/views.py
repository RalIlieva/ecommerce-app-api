# from rest_framework import generics, status
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response
# from .models import WishlistItem
# from .serializers import WishlistSerializer, WishlistItemSerializer
# from .services import (
#     get_or_create_wishlist,
#     add_product_to_wishlist,
#     remove_product_from_wishlist,
#     move_wishlist_item_to_cart
# )
#
#
# class WishlistView(generics.RetrieveAPIView):
#     permission_classes = [IsAuthenticated]
#     serializer_class = WishlistSerializer
#
#     def get_object(self):
#         return get_or_create_wishlist(self.request.user)
#
#
# class AddToWishlistView(generics.CreateAPIView):
#     permission_classes = [IsAuthenticated]
#     serializer_class = WishlistItemSerializer
#
#     def create(self, request, *args, **kwargs):
#         product_uuid = request.data.get('product_uuid')
#         add_product_to_wishlist(request.user, product_uuid)
#         return Response({'detail': 'Product added to wishlist.'}, status=status.HTTP_201_CREATED)
#
#
# class RemoveFromWishlistView(generics.DestroyAPIView):
#     permission_classes = [IsAuthenticated]
#
#     def delete(self, request, *args, **kwargs):
#         product_uuid = kwargs.get('product_uuid')
#         remove_product_from_wishlist(request.user, product_uuid)
#         return Response({'detail': 'Product removed from wishlist.'}, status=status.HTTP_204_NO_CONTENT)
#
#
# class MoveToCartView(generics.CreateAPIView):
#     permission_classes = [IsAuthenticated]
#
#     def post(self, request, *args, **kwargs):
#         product_uuid = request.data.get('product_uuid')
#         move_wishlist_item_to_cart(request.user, product_uuid)
#         return Response({'detail': 'Product moved to cart.'}, status=status.HTTP_200_OK)
