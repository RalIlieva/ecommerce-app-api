"""
Views for the products' images API for vendors.
"""

from rest_framework import generics, permissions
from rest_framework import serializers
from core.permissions import IsVendor
from products.models import Product, ProductImage
from products.serializers import (
    ProductImageSerializer
)


# Product Image Upload View
class VendorProductImageUploadView(generics.CreateAPIView):
    """
    POST: View to upload an image to a product.
    Only superusers and administrators, vendors can access this view.
    """
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendor]

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


class VendorProductImageDeleteView(generics.DestroyAPIView):
    """
    DELETE: View to delete a product image.
    Only superusers and administrators, vendors can access the view.
    """
    queryset = ProductImage.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsVendor]
    lookup_field = 'id'
    lookup_url_kwarg = 'image_id'

    def get_queryset(self):
        """Filter to only allow deletion of images related to the product."""
        uuid = self.kwargs.get('uuid')
        slug = self.kwargs.get('slug')
        return self.queryset.filter(product__uuid=uuid, product__slug=slug)
