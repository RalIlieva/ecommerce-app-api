# vendor/urls/products_urls.py
from django.urls import path
from vendor.views.products import vendor_product_views

app_name = 'vendor_products'

urlpatterns = [
    # Product URLs
    path('products/create/',
         vendor_product_views.VendorProductCreateView.as_view(),
         name='vendor-product-create'
         ),
    path('products/<uuid:uuid>/manage/',
         vendor_product_views.VendorProductUpdateDeleteView.as_view(),
         name='vendor-product-manage'
         ),
    path('products/<uuid:uuid>/<slug:slug>/',
         vendor_product_views.VendorProductDetailView.as_view(),
         name='vendor-product-detail'
         ),
    path('products/',
         vendor_product_views.VendorProductListView.as_view(),
         name='vendor-product-list'
         ),
]
