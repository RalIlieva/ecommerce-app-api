"""
URL mappings for the cart app.
"""

from django.urls import path
from .views import (
    CartDetailView,
    AddCartItemView,
    UpdateCartItemView,
    RemoveCartItemView,
    ClearCartView,
)

app_name = 'cart'

urlpatterns = [
    path(
        '', CartDetailView.as_view(),
        name='cart-detail'
    ),
    path(
        'add/', AddCartItemView.as_view(),
        name='add-cart-item'
    ),
    path(
        'update/<uuid:uuid>/', UpdateCartItemView.as_view(),
        name='update-cart-item'
    ),
    path(
        'remove/<uuid:uuid>/', RemoveCartItemView.as_view(),
        name='remove-cart-item'
    ),
    path(
        'clear/', ClearCartView.as_view(), name='clear-cart'
    ),
]
