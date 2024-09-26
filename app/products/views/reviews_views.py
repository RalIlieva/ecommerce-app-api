"""
Views for the products' reviews API.
"""

from django.shortcuts import get_object_or_404

from rest_framework import generics, permissions
from ..permissions import IsOwnerOrReadOnly
from ..models import Product, Review
from ..serializers import (
    ReviewSerializer,
    ReviewListSerializer,
    ReviewDetailSerializer
)


class ReviewListView(generics.ListAPIView):
    """
    GET: List all reviews for a specific product. (user-facing)
    """
    serializer_class = ReviewListSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]
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
        # IsOwnerOrReadonly takes care of the check
        # review = self.get_object()
        # if review.user != self.request.user:
        #     raise PermissionDenied("You can only update your own reviews.")
        serializer.save()

    def perform_destroy(self, instance):
        # IsOwnerOrReadonly takes care of the check
        # if instance.user != self.request.user:
        #     raise PermissionDenied("You can only delete your own reviews.")
        instance.delete()
