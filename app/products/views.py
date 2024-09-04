"""
Views for the products API.
"""

from rest_framework import generics, permissions
from .models import Product, Category, Tag, ProductImage
from .serializers import (
    ProductDetailSerializer,
    ProductMiniSerializer,
    CategorySerializer,
    TagSerializer,
    ProductImageSerializer
)
# from .permissions import IsAdminOrReadOnly
from .selectors import get_active_products


# Product Views
class ProductListView(generics.ListAPIView):
    """
    View to list all products.
    All users can access this view.
    """
    queryset = get_active_products()
    serializer_class = ProductMiniSerializer

    def get_queryset(self):
        """
        Optionally restricts the returned products by filtering against
        a `category` and 'tags' query parameter in the URL.
        """
        # tags = self.request.query_params.get('tags')
        category = self.request.query_params.get('category')
        queryset = super().get_queryset()
        # if tags:
        #     tag_ids = self.tags
        #     queryset = queryset.filter(tags__id__in=tag_ids)
        tag_id = self.request.query_params.get('tag')
        if tag_id:
            queryset = queryset.filter(tags__id=tag_id)
        if category:
            category_ids = self.category
            queryset = queryset.filter(category__id__in=category_ids)

        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    """
    View to retrieve a single product.
    All users can access this view.
    """
    queryset = get_active_products()
    serializer_class = ProductDetailSerializer


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


# Category Views
class CategoryListView(generics.ListAPIView):
    """
    View to list all categories to all users.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class CategoryCreateView(generics.CreateAPIView):
    """
    View to create a new category.
    Only superusers and administrators can create categories.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


class CategoryUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """
    View to retrieve, update, or delete a new category.
    Only superusers and administrators can create categories.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


# class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
#     """
#     View to retrieve, update, or delete a category.
#     Only superusers and administrators can access this view.
#     """
#     queryset = Category.objects.all()
#     serializer_class = CategorySerializer
#     permission_classes = [
#     permissions.IsAuthenticated,
#     permissions.IsAdminUser
#     ]


# Tag Views
class TagListView(generics.ListAPIView):
    """
    View to list all tags.
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class TagCreateView(generics.CreateAPIView):
    """
    View to create a tag.
    Only superusers and administrators can access this view.
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


class TagUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """
    View to retrieve, update, or delete a tag.
    Only superusers and administrators can access this view.
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


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
        product_id = self.kwargs.get('product_id')
        product = Product.objects.get(id=product_id)
        serializer.save(product=product)


class ProductImageDeleteView(generics.DestroyAPIView):
    """View to delete a product image."""
    queryset = ProductImage.objects.all()
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    lookup_field = 'id'
    lookup_url_kwarg = 'image_id'

    def get_queryset(self):
        """Filter to only allow deletion of images related to the product."""
        product_id = self.kwargs.get('product_id')
        return self.queryset.filter(product_id=product_id)
