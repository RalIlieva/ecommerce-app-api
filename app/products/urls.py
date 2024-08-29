"""
URL mappings for the products app.
"""

from django.urls import path
from .views import (
    ProductListView,
    ProductDetailView,
    ProductCreateView,
    ProductUpdateDeleteView,
    CategoryListView,
    CategoryCreateView,
    CategoryUpdateDeleteView,
    TagListView,
    TagCreateView,
    TagUpdateDeleteView,
    ProductImageUploadView
)


# A namespace for the products app
app_name = 'products'

urlpatterns = [
    # Product URLs
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<int:pk>/',
         ProductDetailView.as_view(),
         name='product-detail'
         ),
    path('products/create/',
         ProductCreateView.as_view(),
         name='product-create'
         ),
    path('products/<int:pk>/manage/',
         ProductUpdateDeleteView.as_view(),
         name='product-manage'
         ),

    # Category URLs
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('categories/create/',
         CategoryCreateView.as_view(),
         name='category-create'
         ),
    path('categories/<int:pk>/manage/',
         CategoryUpdateDeleteView.as_view(),
         name='category-manage'
         ),

    # Tag URLs
    path('tags/', TagListView.as_view(), name='tag-list'),
    path('tags/create/', TagCreateView.as_view(), name='tag-create'),
    path('tags/<int:pk>/manage/',
         TagUpdateDeleteView.as_view(),
         name='tag-manage'
         ),

    # Product Image Upload URL
    path('products/<int:product_id>/upload-image/',
         ProductImageUploadView.as_view(),
         name='product-image-upload'
         ),
]
