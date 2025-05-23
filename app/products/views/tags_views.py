"""
Views for the products' tags API.
"""
from drf_spectacular.utils import (
    extend_schema_view,
    extend_schema,
    OpenApiParameter,
    OpenApiTypes
)
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework import generics, permissions
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
@extend_schema_view(
    list=extend_schema(
        parameters=[
            OpenApiParameter(
                'name',
                OpenApiTypes.STR,
                description='Filter tags by name. '
                            'Search is case insensitive.'
            ),
        ],
        description="Retrieve a list of tags. Search tags by their name."
    )
)
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
        """
        Retrieve and return the tag based on UUID.
        """
        uuid = self.kwargs.get('uuid')
        tag = get_object_or_404(Tag, uuid=uuid)
        return tag

    def perform_update(self, serializer):
        """
        Perform update on a tag instance & handle unique constraint violations.
        """
        try:
            serializer.save()
        except IntegrityError as e:
            if 'unique constraint' in str(e).lower():
                raise DuplicateSlugException(
                    'Tag with this slug already exists.'
                )
            # Let other IntegrityErrors bubble up
            raise
