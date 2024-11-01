# wishlist/filters.py

import django_filters
from .models import WishlistItem


class WishlistItemFilter(django_filters.FilterSet):
    """Filter for Wishlist items based on product attributes."""
    product_category = django_filters.CharFilter(
        field_name='product__category__name',
        lookup_expr='iexact'
    )
    in_stock = django_filters.BooleanFilter(method='filter_in_stock')

    class Meta:
        model = WishlistItem
        fields = ['product_category', 'in_stock']

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(product__stock__gt=0)
        return queryset
