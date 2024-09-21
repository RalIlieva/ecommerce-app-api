"""
Views for the products API.
"""

from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework import generics, permissions
from ..models import Product, Category, Tag, ProductImage
from ..serializers import (
    ProductDetailSerializer,
    ProductMiniSerializer,
    CategorySerializer,
    CategoryListSerializer,
    CategoryDetailSerializer,
    TagSerializer,
    TagListSerializer,
    TagDetailSerializer,
    ProductImageSerializer
)
# from .permissions import IsAdminOrReadOnly
from ..selectors import get_active_products
from ..filters import ProductFilter
from ..pagination import CustomPagination


# Product Views
class ProductListView(generics.ListAPIView):
    """
    View to list all products.
    All users can access this view.
    """
    queryset = get_active_products().prefetch_related('tags', 'category').\
        order_by('id')
    serializer_class = ProductMiniSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description']  # Fields to search by
    pagination_class = CustomPagination


class ProductDetailView(generics.RetrieveAPIView):
    """
    View to retrieve a single product.
    All users can access this view.
    """
    queryset = get_active_products()
    serializer_class = ProductDetailSerializer
    # # Better security practice
    # lookup_field = 'uuid'

    def get_object(self):
        uuid = self.kwargs.get('uuid')
        slug = self.kwargs.get('slug')
        product = get_object_or_404(
            Product,
            uuid=uuid,
            slug=slug,
            is_active=True
        )
        return product


class ProductCreateView(generics.CreateAPIView):
    """
    View to create a product.
    Only superusers and administrators can access this view.
    """
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


class ProductUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """
    View to update, or delete a product.
    Only superusers and administrators can access this view.
    """
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get_object(self):
        uuid = self.kwargs.get('uuid')
        product = get_object_or_404(Product, uuid=uuid)
        return product

    # # TO DECIDE
    # def perform_update(self, serializer):
    #     try:
    #         serializer.save()
    #     except ValidationError as ve:
    #         raise serializers.ValidationError(ve.detail)
    #     except DuplicateSlugException as dse:
    #         raise dse
    #     except IntegrityError as e:
    #         if 'unique constraint' in str(e).lower():
    #             raise DuplicateSlugException(
    #             'A product with this slug already exists.'
    #             )
    #         raise e
