"""
Views for the products' images API.
"""

from rest_framework import generics, permissions
from ..models import Product, ProductImage
from ..serializers import (
    ProductImageSerializer
)


# Product Image Upload View
class ProductImageUploadView(generics.CreateAPIView):
    """
    POST: View to upload an image to a product.
    Only superusers and administrators can access this view.
    """
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def perform_create(self, serializer):
        uuid = self.kwargs.get('uuid')
        slug = self.kwargs.get('slug')
        product = Product.objects.get(uuid=uuid, slug=slug)
        serializer.save(product=product)


class ProductImageDeleteView(generics.DestroyAPIView):
    """
    DELETE: View to delete a product image.
    Only superusers and administrators can access the view.
    """
    queryset = ProductImage.objects.all()
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    serializer_class = ProductImageSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'image_id'

    def get_queryset(self):
        """Filter to only allow deletion of images related to the product."""
        uuid = self.kwargs.get('uuid')
        slug = self.kwargs.get('slug')
        return self.queryset.filter(product__uuid=uuid, product__slug=slug)
