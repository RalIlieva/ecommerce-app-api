"""
URL mappings for the payment app.
"""

from django.urls import path
from .views import (
    CreatePaymentView,
    stripe_webhook,
    PaymentDetailView,
    PaymentListView
)

app_name = 'payment'

urlpatterns = [
    path(
        'create-payment/', CreatePaymentView.as_view(), name='create-payment'
    ),
    path(
        'webhook/', stripe_webhook, name='stripe-webhook'
    ),
    path(
        '<uuid:uuid>/', PaymentDetailView.as_view(), name='payment-detail'
    ),
    path(
        '', PaymentListView.as_view(), name='payment-list'
    ),
]
