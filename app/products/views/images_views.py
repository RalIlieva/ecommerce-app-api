"""
Views for the products' images API.
"""

from rest_framework import generics, permissions
from rest_framework import serializers
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


# Product Image Upload View
class ProductImageUploadView(generics.CreateAPIView):
    """
    View to upload an image to a product.
    Only superusers and administrators can access this view.
    """
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def perform_create(self, serializer):
        uuid = self.kwargs.get('uuid')
        slug = self.kwargs.get('slug')
        try:
            product = Product.objects.get(uuid=uuid, slug=slug)
        except Product.DoesNotExist:
            raise serializers.ValidationError(
                {"product_id": "Product does not exist."}
            )
        serializer.save(product=product)


class ProductImageDeleteView(generics.DestroyAPIView):
    """View to delete a product image."""
    queryset = ProductImage.objects.all()
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    lookup_field = 'id'
    lookup_url_kwarg = 'image_id'

    def get_queryset(self):
        """Filter to only allow deletion of images related to the product."""
        uuid = self.kwargs.get('uuid')
        slug = self.kwargs.get('slug')
        return self.queryset.filter(product__uuid=uuid, product__slug=slug)
