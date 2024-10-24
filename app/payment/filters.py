"""
Filters for payments.
"""

from django_filters import rest_framework as filters
from .models import Payment


class PaymentFilter(filters.FilterSet):
    """
    Filter class for Payment model.
    """
    # Allows filtering payments by status
    status = filters.CharFilter(
        field_name='status', lookup_expr='iexact'
    )

    class Meta:
        model = Payment
        fields = ['status']
