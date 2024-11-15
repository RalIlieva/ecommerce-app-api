# vendor/urls/image_urls.py
from django.urls import path
from vendor.views.products import vendor_image_views

app_name = 'vendor_images'

urlpatterns = [
    # Product URLs
    path('products/<uuid:uuid>/<slug:slug>/upload-image/',
         vendor_image_views.VendorProductImageUploadView.as_view(),
         name='vendor-product-image-upload'
         ),
    path('products/<uuid:uuid>/<slug:slug>/images/<int:image_id>/delete/',
         vendor_image_views.VendorProductImageDeleteView.as_view(),
         name='vendor-product-image-delete'
         ),
    ]
