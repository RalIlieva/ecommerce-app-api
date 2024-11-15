# vendor/urls/category_urls.py
from django.urls import path
from vendor.views.products import vendor_category_views

app_name = 'vendor_categories'

urlpatterns = [
    # Product URLs
    path('categories/create/',
         vendor_category_views.VendorCategoryCreateView.as_view(),
         name='vendor-category-create'
         ),
    path('categories/<uuid:uuid>/manage/',
         vendor_category_views.VendorCategoryUpdateDeleteView.as_view(),
         name='vendor-category-manage'
         ),
    path('categories/<slug:slug>/',
         vendor_category_views.VendorCategoryDetailView.as_view(),
         name='vendor-category-detail'),
    path('categories/',
         vendor_category_views.VendorCategoryListView.as_view(),
         name='vendor-category-list'
         ),
]
