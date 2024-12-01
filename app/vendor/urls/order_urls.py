# vendor/urls/order_urls.py

from django.urls import path
from vendor.views.order.vendor_order_views import (
    VendorOrderListView,
    VendorOrderDetailView,
    VendorOrderStatusUpdateView
)

app_name = 'vendor_orders'

urlpatterns = [
    path(
        '', VendorOrderListView.as_view(),
        name='vendor-order-list'
    ),
    path(
        '<uuid:order_uuid>/', VendorOrderDetailView.as_view(),
        name='vendor-order-detail'
    ),
    path(
        '<uuid:order_uuid>/status/',
        VendorOrderStatusUpdateView.as_view(),
        name='vendor-order-status-update'
    ),
]
