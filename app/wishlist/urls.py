from django.urls import path
from .views import (
    WishlistView,
    AddToWishlistView,
    RemoveFromWishlistView,
    MoveToCartView
)

# A namespace for the order app
app_name = 'wishlist'

urlpatterns = [
    path('', WishlistView.as_view(), name='wishlist-detail'),
    path('add/', AddToWishlistView.as_view(), name='wishlist-add'),
    path('remove/<uuid:product_uuid>/', RemoveFromWishlistView.as_view(), name='wishlist-remove'),
    path('move-to-cart/', MoveToCartView.as_view(), name='wishlist-move-to-cart'),
]
