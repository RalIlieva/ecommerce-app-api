"""
URL mappings for the order app.
"""

from django.urls import path
from .views import (
    OrderListView,
    OrderCreateView,
    OrderDetailView,
    OrderCancelView,
    AdminOrderListView,
    AdminOrderDetailView,
)

# A namespace for the order app
app_name = 'order'

urlpatterns = [
    # Customer-facing views
    path('orders/', OrderListView.as_view(), name='order-list'),
    path('orders/create/', OrderCreateView.as_view(), name='order-create'),
    path('<uuid:order_uuid>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/<uuid:order_uuid>/cancel/', OrderCancelView.as_view(), name='order-cancel'),

    # Admin-facing views
    path('orders/admin/<uuid:order_uuid>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('orders/admin/', AdminOrderListView.as_view(), name='admin-order-list'),
    # path('admin/orders/', AdminOrderListView.as_view(), name='admin-order-list'),
    # path('admin/orders/<uuid:order_uuid>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
]
