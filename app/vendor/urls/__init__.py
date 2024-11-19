# vendor/urls/__init__.py
from django.urls import include, path

app_name = 'vendor'

# Include submodules explicitly
urlpatterns = [
    path('products/', include(
        'vendor.urls.products_urls',
        namespace='products')
         ),
    path('products/', include(
        'vendor.urls.image_urls',
        namespace='images')
         ),
    path('categories/', include(
        'vendor.urls.category_urls',
        namespace='categories')
         ),
    path('tags/', include(
        'vendor.urls.tags_urls',
        namespace='tags')
         ),
    path('orders/', include(
        'vendor.urls.order_urls',
        namespace='orders')
    ),
    path('dashboard/', include(
        'vendor.urls.dashboard_urls',
        namespace='dashboard'
    )
         ),
]
