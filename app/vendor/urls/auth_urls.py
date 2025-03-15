# vendor/urls/auth_urls.py
from django.urls import path
from vendor.views.auth import vendor_login

app_name = 'vendor_auth'

urlpatterns = [
    path('login/', vendor_login, name='vendor-login'),
]
