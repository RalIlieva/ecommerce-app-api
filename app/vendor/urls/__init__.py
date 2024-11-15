# vendor/urls/__init__.py
from django.urls import include, path

app_name = 'vendor'

# Include submodules explicitly
urlpatterns = [
    path('products/', include('vendor.urls.products_urls', namespace='products')),
]
