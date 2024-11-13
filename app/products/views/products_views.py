"""
Views for the products API.
"""
from drf_spectacular.utils import (
    extend_schema_view,
    extend_schema,
    OpenApiParameter,
    OpenApiTypes
)
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework import generics, permissions
from ..models import Product
from ..serializers import (
    ProductDetailSerializer,
    ProductMiniSerializer,
)
# from .permissions import IsAdminOrReadOnly
from ..selectors import get_active_products
from ..filters import ProductFilter
from ..pagination import CustomPagination


# Product Views
@extend_schema_view(
    list=extend_schema(
        parameters=[
            OpenApiParameter(
                'name',
                OpenApiTypes.STR,
                description='Filter products by name. '
                            'Search is case insensitive.'
            ),
            OpenApiParameter(
                'tags',
                OpenApiTypes.STR,
                description='Comma separated list of tag IDs '
                            'to filter products by tags.'
            ),
            OpenApiParameter(
                'category',
                OpenApiTypes.STR,
                description='Filter products by category slug.'
            ),
            OpenApiParameter(
                'min_price',
                OpenApiTypes.FLOAT,
                description='Filter products by minimum price.'
            ),
            OpenApiParameter(
                'max_price',
                OpenApiTypes.FLOAT,
                description='Filter products by maximum price.'
            ),
            OpenApiParameter(
                'min_avg_rating',
                OpenApiTypes.FLOAT,
                description='Filter products by minimum average rating.'
            ),
            OpenApiParameter(
                'max_avg_rating',
                OpenApiTypes.FLOAT,
                description='Filter products by maximum average rating.'
            ),
        ],
        description="Retrieve a list of products. "
                    "Filter by name, tags, category, price range, avg rating."
    )
)
class ProductListView(generics.ListAPIView):
    """
    GET: View to list all products.
    All users can access this view. (user-facing)
    """
    queryset = get_active_products().prefetch_related('tags', 'category').\
        order_by('id')
    serializer_class = ProductMiniSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description']  # Fields to search by
    pagination_class = CustomPagination
    permission_classes = [permissions.AllowAny]


class ProductDetailView(generics.RetrieveAPIView):
    """
    GET: View to retrieve a single product.
    All users can access this view. (user-facing)
    """
    # queryset = get_active_products()
    queryset = get_active_products().select_related(
        'category'
    ).prefetch_related(
        'tags', 'images', 'reviews__user')
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
    POST: View to create a product.
    Only superusers and administrators can access this view.
    """
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


class ProductUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """
    PUT/PATCH: View to update, or
    DELETE: delete a product.
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
