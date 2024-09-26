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
from ..models import Tag
from ..serializers import (
    TagSerializer,
    TagListSerializer,
    TagDetailSerializer,
)
from ..filters import TagFilter
from ..pagination import CustomPagination


# Tag Views
class TagListView(generics.ListAPIView):
    """
    GET: View to list all tags. (user-facing)
    """
    queryset = Tag.objects.all().order_by('id')
    serializer_class = TagListSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = TagFilter
    search_fields = ['name']  # Fields to search by
    pagination_class = CustomPagination
    permission_classes = [permissions.AllowAny]


class TagCreateView(generics.CreateAPIView):
    """
    POST: View to create a tag.
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
    GET: Retrieve tags details (user-facing)
    """
    queryset = Tag.objects.all()
    serializer_class = TagDetailSerializer
    lookup_field = 'slug'
    lookup_url_kwarg = 'slug'
    permission_classes = [permissions.AllowAny]


class TagUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """
    PUT/PATCH: View to retrieve, update, or
    DELETE: delete a tag.
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
