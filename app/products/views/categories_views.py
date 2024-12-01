"""
Views for the products' categories API.
"""
from drf_spectacular.utils import (
    extend_schema_view,
    extend_schema,
    OpenApiParameter,
    OpenApiTypes
)
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework import generics, permissions
from rest_framework import serializers
from core.exceptions import DuplicateSlugException
from ..models import Category
from ..serializers import (
    CategorySerializer,
    CategoryListSerializer,
    CategoryDetailSerializer,
)
from ..filters import CategoryFilter
from ..pagination import CustomPagination


# Category Views
@extend_schema_view(
    list=extend_schema(
        parameters=[
            OpenApiParameter(
                'name',
                OpenApiTypes.STR,
                description='Filter categories by name. '
                            'Search is case insensitive.'
            ),
        ],
        description="Retrieve a list of categories. "
                    "Search categories by their name."
    )
)
class CategoryListView(generics.ListAPIView):
    """
    GET: View to list all categories to all users.
    (user-facing)
    """
    queryset = Category.objects.all().order_by('id')
    serializer_class = CategoryListSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = CategoryFilter
    search_fields = ['name']  # Fields to search by
    pagination_class = CustomPagination
    permission_classes = [permissions.AllowAny]


class CategoryCreateView(generics.CreateAPIView):
    """
    POST: View to create a new category.
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
            # Let other IntegrityErrors bubble up
            raise


class CategoryUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """
    PUT/PATCH: View to retrieve, update, or
    DELETE: delete a new category.
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
    GET: Retrieve category details (user-facing).
    """
    queryset = Category.objects.all()
    serializer_class = CategoryDetailSerializer
    lookup_field = 'slug'
    lookup_url_kwarg = 'slug'
    permission_classes = [permissions.AllowAny]
