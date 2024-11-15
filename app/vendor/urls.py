# vendor/urls.py
from django.urls import path, include

app_name = 'vendor'

urlpatterns = [
    path('products/', include('vendor.urls.products_urls', namespace='products')),
]
