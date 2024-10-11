"""
URL mappings for the order app.
"""

from django.urls import path
from .views import OrderListView, OrderCreateView, OrderDetailView

# A namespace for the order app
app_name = 'order'

urlpatterns = [
    path('orders/', OrderListView.as_view(), name='order-list'),
    path('orders/create/', OrderCreateView.as_view(), name='order-create'),
    path('orders/<int:order_id>/', OrderDetailView.as_view(), name='order-detail'),
]
