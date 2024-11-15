# vendor/urls/tags_urls.py
from django.urls import path
from vendor.views.products import vendor_tag_views

app_name = 'vendor_tags'

urlpatterns = [
    # Product URLs
    path('tags/create/',
         vendor_tag_views.VendorTagCreateView.as_view(),
         name='vendor-tag-create'
         ),
    path('tags/<uuid:uuid>/manage/',
         vendor_tag_views.VendorTagUpdateDeleteView.as_view(),
         name='vendor-tag-manage'
         ),
    path('tags/<slug:slug>/',
         vendor_tag_views.VendorTagDetailView.as_view(),
         name='vendor-tag-detail'),
    path('tags/',
         vendor_tag_views.VendorTagListView.as_view(),
         name='vendor-tag-list'),
]
