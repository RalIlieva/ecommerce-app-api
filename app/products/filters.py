"""
Filters for products.
"""

import django_filters
from .models import (
    Product,
    Tag,
    # Category,
)


class ProductFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(
        field_name='name',
        lookup_expr='icontains',
        label='Search by Name'
    )
    tags = django_filters.ModelMultipleChoiceFilter(
        queryset=Tag.objects.all(),
        field_name='tags__id',  # Filter by tag IDs
        to_field_name='id',
        label='Filter by Tags'
    )
    category = django_filters.CharFilter(
        field_name='category__slug',
        label='Filter by Category'
    )
    min_price = django_filters.NumberFilter(
        field_name='price',
        lookup_expr='gte',
        label='Min Price'
    )
    max_price = django_filters.NumberFilter(
        field_name='price',
        lookup_expr='lte',
        label='Max Price'
    )

    class Meta:
        model = Product
        fields = ['name', 'tags', 'category', 'min_price', 'max_price']
