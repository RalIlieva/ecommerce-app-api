"""
Views for the products API.
"""

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
# from rest_framework.response import Response
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
# from .services import get_or_create_category
from .selectors import get_active_products
from .filters import ProductFilter
from .pagination import CustomPagination


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

    # def get_queryset(self):
    #     """
    #     Optionally restricts the returned products by filtering against
    #     a `category` and 'tags' query parameter in the URL.
    #     """
    #     category = self.request.query_params.get('category')
    #     queryset = super().get_queryset()
    #     tag_id = self.request.query_params.get('tag')
    #     if tag_id:
    #         queryset = queryset.filter(tags__id=tag_id)
    #     if category:
    #         category_ids = self.category
    #         queryset = queryset.filter(category__id__in=category_ids)
    #
    #     return queryset


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
    queryset = Category.objects.all().order_by('id')
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

    # def perform_create(self, serializer):
    #     # Perform the logic of getting or creating a category here
    #     category = get_or_create_category(serializer.validated_data)
    #     serializer.save(id=category.id)


class CategoryUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """
    View to retrieve, update, or delete a new category.
    Only superusers and administrators can create categories.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    # def partial_update(self, request, *args, **kwargs):
    #     instance = self.get_object()
    #     serializer = self.get_serializer(instance, data=request.data, partial=True)
    #     serializer.is_valid(raise_exception=True)
    #     serializer.save()  # Save with validated data, not a model instance
    #     return Response(serializer.data)

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
    queryset = Tag.objects.all().order_by('id')
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
