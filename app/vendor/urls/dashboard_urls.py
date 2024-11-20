# vendor/urls/dashboard_urls.py

from django.urls import path
from vendor.views.dashboard.vendor_dashboard_overview import VendorDashboardView
from vendor.views.dashboard.vendor_payment_views import VendorPaymentListView
from vendor.views.dashboard.vendor_wishlist_views import VendorWishlistView
from vendor.views.dashboard.vendor_cart_views import VendorCartInfoView

app_name = 'vendor_dashboard'

urlpatterns = [
    path(
        'dashboard/', VendorDashboardView.as_view(),
        name='dashboard-overview'
    ),
    path(
        'payments/', VendorPaymentListView.as_view(),
        name='payment-list'
    ),
    path(
        'wishlist/', VendorWishlistView.as_view(),
        name='wishlist-list'
    ),
    path(
        'cart/', VendorCartInfoView.as_view(),
        name='cart-list'
    ),
]
