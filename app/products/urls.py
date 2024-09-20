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
         ),
    path('products/<uuid:uuid>/manage/',
         ProductUpdateDeleteView.as_view(),
         name='product-manage'
         ),
    path('products/<uuid:uuid>/<slug:slug>/',
         ProductDetailView.as_view(),
         name='product-detail'
         ),
    path('products/', ProductListView.as_view(), name='product-list'),
    # path('products/<int:pk>/manage/',
    #      ProductUpdateDeleteView.as_view(),
    #      name='product-manage'
    #      ),
    # path('products/<int:pk>/',
    #      ProductDetailView.as_view(),
    #      name='product-detail'
    #      ),

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
    path('categories/<slug:slug>/',
         CategoryDetailView.as_view(),
         name='category-detail'),  # User-facing detail

    # Tag URLs
    path('tags/', TagListView.as_view(), name='tag-list'),
    path('tags/create/', TagCreateView.as_view(), name='tag-create'),
    path('tags/<int:pk>/manage/',
         TagUpdateDeleteView.as_view(),
         name='tag-manage'
         ),
    path('tags/<slug:slug>/',
         TagDetailView.as_view(),
         name='tag-detail'),  # User-facing detail

    # Product Image URL
    # path('products/<int:product_id>/upload-image/',
    #      ProductImageUploadView.as_view(),
    #      name='product-image-upload'
    #      ),
    # path('products/<int:product_id>/images/<int:image_id>/delete/',
    #      ProductImageDeleteView.as_view(),
    #      name='product-image-delete'
    #      ),

    path('products/<uuid:uuid>/<slug:slug>/upload-image/',
         ProductImageUploadView.as_view(),
         name='product-image-upload'
         ),
    path('products/<uuid:uuid>/<slug:slug>/images/<int:image_id>/delete/',
         ProductImageDeleteView.as_view(),
         name='product-image-delete'
         ),
]
