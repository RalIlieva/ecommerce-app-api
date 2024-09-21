# """
# Views for the products API.
# """
#
# from django.db import IntegrityError
# from django.shortcuts import get_object_or_404
# from django.core.exceptions import ValidationError
# from django_filters.rest_framework import DjangoFilterBackend
# from rest_framework.filters import SearchFilter
# from rest_framework import generics, permissions
# from rest_framework import serializers
# from core.exceptions import DuplicateSlugException
# from .models import Product, Category, Tag, ProductImage
# from .serializers import (
#     ProductDetailSerializer,
#     ProductMiniSerializer,
#     CategorySerializer,
#     CategoryListSerializer,
#     CategoryDetailSerializer,
#     TagSerializer,
#     TagListSerializer,
#     TagDetailSerializer,
#     ProductImageSerializer
# )
# # from .permissions import IsAdminOrReadOnly
# from .selectors import get_active_products
# from .filters import ProductFilter
# from .pagination import CustomPagination


# # Product Views
# class ProductListView(generics.ListAPIView):
#     """
#     View to list all products.
#     All users can access this view.
#     """
#     queryset = get_active_products().prefetch_related('tags', 'category').\
#         order_by('id')
#     serializer_class = ProductMiniSerializer
#     filter_backends = [DjangoFilterBackend, SearchFilter]
#     filterset_class = ProductFilter
#     search_fields = ['name', 'description']  # Fields to search by
#     pagination_class = CustomPagination
#
#
# class ProductDetailView(generics.RetrieveAPIView):
#     """
#     View to retrieve a single product.
#     All users can access this view.
#     """
#     queryset = get_active_products()
#     serializer_class = ProductDetailSerializer
#     # # Better security practice
#     # lookup_field = 'uuid'
#
#     def get_object(self):
#         uuid = self.kwargs.get('uuid')
#         slug = self.kwargs.get('slug')
#         product = get_object_or_404(
#             Product,
#             uuid=uuid,
#             slug=slug,
#             is_active=True
#         )
#         return product
#
#
# class ProductCreateView(generics.CreateAPIView):
#     """
#     View to create a product.
#     Only superusers and administrators can access this view.
#     """
#     queryset = Product.objects.all()
#     serializer_class = ProductDetailSerializer
#     permission_classes = [
#     permissions.IsAuthenticated,
#     permissions.IsAdminUser
#     ]
#
#
# class ProductUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
#     """
#     View to update, or delete a product.
#     Only superusers and administrators can access this view.
#     """
#     queryset = Product.objects.all()
#     serializer_class = ProductDetailSerializer
#     permission_classes = [
#     permissions.IsAuthenticated,
#     permissions.IsAdminUser
#     ]
#
#     def get_object(self):
#         uuid = self.kwargs.get('uuid')
#         product = get_object_or_404(Product, uuid=uuid)
#         return product
#
#     # # TO DECIDE
#     # def perform_update(self, serializer):
#     #     try:
#     #         serializer.save()
#     #     except ValidationError as ve:
#     #         raise serializers.ValidationError(ve.detail)
#     #     except DuplicateSlugException as dse:
#     #         raise dse
#     #     except IntegrityError as e:
#     #         if 'unique constraint' in str(e).lower():
#     #             raise DuplicateSlugException(
#     #             'A product with this slug already exists.'
#     #             )
#     #         raise e


# # Category Views
# class CategoryListView(generics.ListAPIView):
#     """
#     View to list all categories to all users.
#     """
#     queryset = Category.objects.all().order_by('id')
#     serializer_class = CategoryListSerializer
#     permission_classes = [permissions.IsAuthenticated]
#
#
# class CategoryCreateView(generics.CreateAPIView):
#     """
#     View to create a new category.
#     Only superusers and administrators can create categories.
#     """
#     queryset = Category.objects.all()
#     serializer_class = CategorySerializer
#     permission_classes = [
#     permissions.IsAuthenticated,
#     permissions.IsAdminUser
#     ]
#
#     def perform_create(self, serializer):
#         try:
#             serializer.save()
#         except IntegrityError as e:
#             if 'unique constraint' in str(e).lower():
#                 raise DuplicateSlugException(
#                     'Category with this slug already exists.'
#                 )
#             raise e
#
#
# class CategoryUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
#     """
#     View to retrieve, update, or delete a new category.
#     Only superusers and administrators can create categories.
#     """
#     queryset = Category.objects.all()
#     serializer_class = CategorySerializer
#     permission_classes = [
#     permissions.IsAuthenticated,
#     permissions.IsAdminUser
#     ]
#     lookup_field = 'uuid'
#     lookup_url_kwarg = 'uuid'
#
#     def get_object(self):
#         uuid = self.kwargs.get('uuid')
#         category = get_object_or_404(Category, uuid=uuid)
#         return category
#
#     # TO DECIDE - longer or shorter perform_update
#     def perform_update(self, serializer):
#         try:
#             serializer.save()
#         except ValidationError as ve:
#             raise serializers.ValidationError(ve.detail)
#         except DuplicateSlugException as dse:
#             raise dse
#         except IntegrityError as e:
#             if 'unique constraint' in str(e).lower():
#                 raise DuplicateSlugException(
#                     'Category with this slug already exists.'
#                 )
#             raise e
#
#
# class CategoryDetailView(generics.RetrieveAPIView):
#     """
#     Retrieve category details (user-facing).
#     """
#     queryset = Category.objects.all()
#     serializer_class = CategoryDetailSerializer
#     lookup_field = 'slug'
#     lookup_url_kwarg = 'slug'
#     # permission_classes = [permissions.AllowAny]

#
# # Tag Views
# class TagListView(generics.ListAPIView):
#     """
#     View to list all tags.
#     """
#     queryset = Tag.objects.all().order_by('id')
#     serializer_class = TagListSerializer
#
#
# class TagCreateView(generics.CreateAPIView):
#     """
#     View to create a tag.
#     Only superusers and administrators can access this view.
#     """
#     queryset = Tag.objects.all()
#     serializer_class = TagSerializer
#     permission_classes = [
#     permissions.IsAuthenticated,
#     permissions.IsAdminUser
#     ]
#
#     def perform_create(self, serializer):
#         try:
#             serializer.save()
#         except IntegrityError as e:
#             # Catch the unique constraint error and raise a custom exception
#             if 'unique constraint' in str(e):
#                 raise DuplicateSlugException(
#                     'Tag with this slug already exists.'
#                 )
#             raise e
#
#
# class TagDetailView(generics.RetrieveAPIView):
#     """
#     Retrieve tags details (user-facing)
#     """
#     queryset = Tag.objects.all()
#     serializer_class = TagDetailSerializer
#     lookup_field = 'slug'
#     lookup_url_kwarg = 'slug'
#     # permission_classes = [permissions.AllowAny]
#
#
# class TagUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
#     """
#     View to retrieve, update, or delete a tag.
#     Only superusers and administrators can access this view.
#     """
#     queryset = Tag.objects.all()
#     serializer_class = TagSerializer
#     permission_classes = [
#     permissions.IsAuthenticated,
#     permissions.IsAdminUser
#     ]
#     lookup_field = 'uuid'
#     lookup_url_kwarg = 'uuid'
#
#     def get_object(self):
#         uuid = self.kwargs.get('uuid')
#         tag = get_object_or_404(Tag, uuid=uuid)
#         return tag
#
#     # TO DECIDE - shorter or longer perform_update
#     def perform_update(self, serializer):
#         try:
#             serializer.save()
#         except ValidationError as ve:
#             raise serializers.ValidationError(ve.detail)
#         except DuplicateSlugException as dse:
#             raise dse
#         except IntegrityError as e:
#             if 'unique constraint' in str(e).lower():
#                 raise DuplicateSlugException(
#                     'Tag with this slug already exists.'
#                 )
#             raise e


# # Product Image Upload View
# class ProductImageUploadView(generics.CreateAPIView):
#     """
#     View to upload an image to a product.
#     Only superusers and administrators can access this view.
#     """
#     queryset = ProductImage.objects.all()
#     serializer_class = ProductImageSerializer
#     permission_classes = [
#     permissions.IsAuthenticated,
#     permissions.IsAdminUser
#     ]
#
#     def perform_create(self, serializer):
#         # product_id = self.kwargs.get('product_id')
#         # try:
#         #     product = Product.objects.get(id=product_id)
#         uuid = self.kwargs.get('uuid')
#         slug = self.kwargs.get('slug')
#         try:
#             product = Product.objects.get(uuid=uuid, slug=slug)
#         except Product.DoesNotExist:
#             raise serializers.ValidationError(
#                 {"product_id": "Product does not exist."}
#             )
#         serializer.save(product=product)
#
#
# class ProductImageDeleteView(generics.DestroyAPIView):
#     """View to delete a product image."""
#     queryset = ProductImage.objects.all()
#     permission_classes = [
#     permissions.IsAuthenticated,
#     permissions.IsAdminUser
#     ]
#     lookup_field = 'id'
#     lookup_url_kwarg = 'image_id'
#
#     # def get_queryset(self):
#     #     """
#     Filter to only allow deletion of images related to the product.
#     """
#     #     product_id = self.kwargs.get('product_id')
#     #     return self.queryset.filter(product_id=product_id)
#
#     def get_queryset(self):
#         """Filter to only allow deletion of images related to the product."""
#         uuid = self.kwargs.get('uuid')
#         slug = self.kwargs.get('slug')
#         return self.queryset.filter(product__uuid=uuid, product__slug=slug)
