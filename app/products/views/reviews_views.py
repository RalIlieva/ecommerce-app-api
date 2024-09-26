"""
Views for the products' reviews API.
"""

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
        product_uuid = self.kwargs.get('product_uuid')
        product = get_object_or_404(Product, uuid=product_uuid)
        return Review.objects.filter(product=product)


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
        product = get_object_or_404(Product, uuid=product_uuid)
        context['product'] = product
        return context

    def perform_create(self, serializer):
        product = self.context['product']
        serializer.save(product=product)


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
