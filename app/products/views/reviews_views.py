"""
Views for the products' reviews API.
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
from ..permissions import IsOwnerOrReadOnly
from ..models import Product, Review
from ..serializers import (
    ReviewSerializer,
    ReviewListSerializer,
    ReviewDetailSerializer
)
from ..filters import ReviewFilter
from ..pagination import CustomPagination


@extend_schema_view(
    list=extend_schema(
        parameters=[
            OpenApiParameter(
                'rating',
                OpenApiTypes.INT,
                description='Filter reviews by exact rating.'
            ),
            OpenApiParameter(
                'min_rating',
                OpenApiTypes.INT,
                description='Filter reviews by minimum rating value.'
            ),
            OpenApiParameter(
                'max_rating',
                OpenApiTypes.INT,
                description='Filter reviews by maximum rating value.'
            ),
        ],
        description="Retrieve a list of reviews for a specific product. "
                    "Filter by rating."
    )
)
class ReviewListView(generics.ListAPIView):
    """
    GET: List all reviews for a specific product. (user-facing)
    """
    serializer_class = ReviewListSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = ReviewFilter
    search_fields = ['rating']  # Fields to search by
    pagination_class = CustomPagination
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        try:
            product_uuid = self.kwargs.get('product_uuid')
            slug = self.kwargs.get('slug')
            # product = get_object_or_404(
            # Product, uuid=product_uuid, slug=slug
            # )
            product = Product.objects.get(uuid=product_uuid, slug=slug)
            return Review.objects.filter(product=product).order_by('-created')
            # return Review.objects.filter(product__uuid=product_uuid)
        except Product.DoesNotExist:
            # Return an empty queryset to avoid errors if product is not found
            return Review.objects.none()


class ReviewCreateView(generics.CreateAPIView):
    """
    POST: Create a new review for a specific product.
    Authenticated users can only create a review.
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        product_uuid = self.kwargs.get('product_uuid')
        slug = self.kwargs.get('slug')
        product = get_object_or_404(Product, uuid=product_uuid, slug=slug)
        context['product'] = product
        return context

    def perform_create(self, serializer):
        serializer.save()

    # def perform_create(self, serializer):
    #     # product = self.context['product']
    #     # Retrieve product from `serializer.context`, not `self.context`
    #     product = serializer.context['product']
    #     serializer.save(product=product)


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve a specific review.
    PUT/PATCH: Update a review.
    DELETE: Delete a review.
    Only authenticated users can retrieve a review and
    only owners of specific review can update/delete it.
    """
    # queryset = Review.objects.all()
    queryset = Review.objects.select_related(
        'user', 'product__category'
    ).prefetch_related(
        'product__tags', 'product__images'
    )
    serializer_class = ReviewDetailSerializer
    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly,
        IsOwnerOrReadOnly
    ]
    lookup_field = 'uuid'
    lookup_url_kwarg = 'uuid'

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()
