"""
Views for the products' categories API.
"""

from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
# from django_filters.rest_framework import DjangoFilterBackend
# from rest_framework.filters import SearchFilter
from rest_framework import generics, permissions
from rest_framework import serializers
from core.exceptions import DuplicateSlugException
from ..models import Category
from ..serializers import (
    CategorySerializer,
    CategoryListSerializer,
    CategoryDetailSerializer,
)


# Category Views
class CategoryListView(generics.ListAPIView):
    """
    View to list all categories to all users.
    """
    queryset = Category.objects.all().order_by('id')
    serializer_class = CategoryListSerializer
    permission_classes = [permissions.IsAuthenticated]


class CategoryCreateView(generics.CreateAPIView):
    """
    View to create a new category.
    Only superusers and administrators can create categories.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def perform_create(self, serializer):
        try:
            serializer.save()
        except IntegrityError as e:
            if 'unique constraint' in str(e).lower():
                raise DuplicateSlugException(
                    'Category with this slug already exists.'
                )
            raise e


class CategoryUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """
    View to retrieve, update, or delete a new category.
    Only superusers and administrators can create categories.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    lookup_field = 'uuid'
    lookup_url_kwarg = 'uuid'

    def get_object(self):
        uuid = self.kwargs.get('uuid')
        category = get_object_or_404(Category, uuid=uuid)
        return category

    # TO DECIDE - longer or shorter perform_update
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
                    'Category with this slug already exists.'
                )
            raise e


class CategoryDetailView(generics.RetrieveAPIView):
    """
    Retrieve category details (user-facing).
    """
    queryset = Category.objects.all()
    serializer_class = CategoryDetailSerializer
    lookup_field = 'slug'
    lookup_url_kwarg = 'slug'
    # permission_classes = [permissions.AllowAny]