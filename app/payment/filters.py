from django_filters import rest_framework as filters
from .models import Payment


class PaymentFilter(filters.FilterSet):
    """
    Filter class for Payment model.
    """
    status = filters.CharFilter(field_name='status', lookup_expr='iexact')  # Allows filtering payments by status

    class Meta:
        model = Payment
        fields = ['status']
