# products/views/__init__.py

from .products_views import (
    ProductListView,
    ProductDetailView,
    ProductCreateView,
    ProductUpdateDeleteView
)
from .categories_views import (
    CategoryListView,
    CategoryDetailView,
    CategoryCreateView,
    CategoryUpdateDeleteView
)
from .tags_views import (
    TagListView,
    TagDetailView,
    TagCreateView,
    TagUpdateDeleteView
)
from .images_views import (
    ProductImageUploadView,
    ProductImageDeleteView
)
from .reviews_views import (
    ReviewListView,
    ReviewCreateView,
    ReviewDetailView
)

__all__ = [
    'ProductListView',
    'ProductDetailView',
    'ProductCreateView',
    'ProductUpdateDeleteView',
    'CategoryListView',
    'CategoryDetailView',
    'CategoryCreateView',
    'CategoryUpdateDeleteView',
    'TagListView',
    'TagDetailView',
    'TagCreateView',
    'TagUpdateDeleteView',
    'ProductImageUploadView',
    'ProductImageDeleteView',
    'ReviewListView',
    'ReviewCreateView',
    'ReviewDetailView'
]
