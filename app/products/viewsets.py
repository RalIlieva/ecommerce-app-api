# """
# Viewsets for the product APIs.
# Just an attempt with the viewsets.
# Better practice - with APIViews.
# """
#
# from rest_framework import viewsets, permissions
# from .models import Product, Review
# from .serializers import ProductDetailSerializer, ProductMiniSerializer, ReviewSerializer
# # from .permissions import IsAdminOrReadOnly
# from .selectors import get_active_products, get_product_by_id
#
#
# class ProductViewSet(viewsets.ModelViewSet):
#     """
#     Viewset for managing products.
#     Only superusers and administrators can perform create/update/delete actions.
#     All users can view products list and retrieve product detail by id.
#     """
#     queryset = get_active_products()
#     serializer_class = ProductDetailSerializer
#     # permission_classes = [IsAdminOrReadOnly]
#
#     def get_serializer_class(self):
#         if self.action == 'list':
#             return ProductMiniSerializer
#         if self.action == 'retrieve':
#             return ProductDetailSerializer
#         return ProductDetailSerializer
#
#     def get_queryset(self):
#         # Customize the queryset based on the action
#         if self.action == 'retrieve':
#             return Product.objects.filter(is_active=True)
#         return get_active_products()
#
#
# class ReviewViewSet(viewsets.ModelViewSet):
#     """
#     Viewset for managing product reviews.
#     Only authenticated users can create/update/delete their reviews.
#     """
#     queryset = Review.objects.all()
#     serializer_class = ReviewSerializer
#     # permission_classes = [permissions.IsAuthenticatedOrReadOnly]
#
#     def perform_create(self, serializer):
#         serializer.save(user=self.request.user)
