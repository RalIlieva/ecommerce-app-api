"""
Views for the products' tags API.
"""

from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework import generics, permissions
from rest_framework import serializers
from core.exceptions import DuplicateSlugException
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


# Tag Views
class TagListView(generics.ListAPIView):
    """
    View to list all tags.
    """
    queryset = Tag.objects.all().order_by('id')
    serializer_class = TagListSerializer


class TagCreateView(generics.CreateAPIView):
    """
    View to create a tag.
    Only superusers and administrators can access this view.
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def perform_create(self, serializer):
        try:
            serializer.save()
        except IntegrityError as e:
            # Catch the unique constraint error and raise a custom exception
            if 'unique constraint' in str(e):
                raise DuplicateSlugException(
                    'Tag with this slug already exists.'
                )
            raise e


class TagDetailView(generics.RetrieveAPIView):
    """
    Retrieve tags details (user-facing)
    """
    queryset = Tag.objects.all()
    serializer_class = TagDetailSerializer
    lookup_field = 'slug'
    lookup_url_kwarg = 'slug'
    # permission_classes = [permissions.AllowAny]


class TagUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """
    View to retrieve, update, or delete a tag.
    Only superusers and administrators can access this view.
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    lookup_field = 'uuid'
    lookup_url_kwarg = 'uuid'

    def get_object(self):
        uuid = self.kwargs.get('uuid')
        tag = get_object_or_404(Tag, uuid=uuid)
        return tag

    # TO DECIDE - shorter or longer perform_update
    def perform_update(self, serializer):
        try:
            serializer.save()
        except ValidationError as ve:
            raise serializers.ValidationError(ve.detail)
        except DuplicateSlugException as dse:
            raise dse
        except IntegrityError as e:
            if 'unique constraint' in str(e).lower():
                raise DuplicateSlugException(
                    'Tag with this slug already exists.'
                )
            raise e
