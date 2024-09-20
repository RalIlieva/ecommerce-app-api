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
    CategoryDetailView,
    TagListView,
    TagCreateView,
    TagUpdateDeleteView,
    TagDetailView,
    ProductImageUploadView,
    ProductImageDeleteView,
)


# A namespace for the products app
app_name = 'products'

urlpatterns = [
    # Product URLs
    path('products/create/',
         ProductCreateView.as_view(),
         name='product-create'
         ),  # Admin
    path('products/<uuid:uuid>/manage/',
         ProductUpdateDeleteView.as_view(),
         name='product-manage'
         ),  # Admin
    path('products/<uuid:uuid>/<slug:slug>/',
         ProductDetailView.as_view(),
         name='product-detail'
         ),  # User-facing detail
    path('products/',
         ProductListView.as_view(),
         name='product-list'
         ),  # User-facing list

    # Category URLs
    path('categories/create/',
         CategoryCreateView.as_view(),
         name='category-create'
         ),  # Admin
    path('categories/<int:pk>/manage/',
         CategoryUpdateDeleteView.as_view(),
         name='category-manage'
         ),  # Admin
    path('categories/<slug:slug>/',
         CategoryDetailView.as_view(),
         name='category-detail'),  # User-facing detail
    path('categories/',
         CategoryListView.as_view(),
         name='category-list'
         ),  # User-facing list

    # Tag URLs
    path('tags/create/',
         TagCreateView.as_view(),
         name='tag-create'
         ),  # Admin-facing
    path('tags/<int:pk>/manage/',
         TagUpdateDeleteView.as_view(),
         name='tag-manage'
         ),  # Admin-facing
    path('tags/<slug:slug>/',
         TagDetailView.as_view(),
         name='tag-detail'),  # User-facing detail
    path('tags/',
         TagListView.as_view(),
         name='tag-list'),  # User-facing list

    # Product Image URL
    path('products/<uuid:uuid>/<slug:slug>/upload-image/',
         ProductImageUploadView.as_view(),
         name='product-image-upload'
         ),  # Admin
    path('products/<uuid:uuid>/<slug:slug>/images/<int:image_id>/delete/',
         ProductImageDeleteView.as_view(),
         name='product-image-delete'
         ),  # Admin
]
