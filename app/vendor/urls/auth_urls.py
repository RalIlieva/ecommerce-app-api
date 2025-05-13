# vendor/urls/auth_urls.py

from django.urls import path
from vendor.views.auth import VendorTokenObtainPairView

app_name = 'vendor_auth'

urlpatterns = [
    path('login/', VendorTokenObtainPairView.as_view(), name='vendor-login'),
]
