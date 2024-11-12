"""
URL configuration for app project.
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='api-schema'),
    path('api/docs/',
         SpectacularSwaggerView.as_view(url_name='api-schema'),
         name='api-docs',
         ),
    path('api/administrator/', include('administrators.urls',
                                       namespace='administrators')),
    path('api/user/', include('users.urls', namespace='users')),
    path('api/login/', TokenObtainPairView.as_view(),
         name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(),
         name='token_refresh'),
    path('api/products/', include('products.urls', namespace='products')),
    path('api/orders/', include('order.urls', namespace='order')),
    path('api/payment/', include('payment.urls', namespace='payment')),
    path('api/cart/', include('cart.urls', namespace='cart')),
    path('api/checkout/', include('checkout.urls', namespace='checkout')),
    path('api/wishlist/', include('wishlist.urls', namespace='wishlist')),
    path('api/notifications/', include(
        'notifications.urls', namespace='notifications')
         )
]
