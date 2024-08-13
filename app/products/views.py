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
#     permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


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
