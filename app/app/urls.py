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
    # Versioned schema and docs
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='api-schema-v1'),
    path('api/v1/docs/',
         SpectacularSwaggerView.as_view(url_name='api-schema-v1'),
         name='api-docs-1',
         ),
    # Versioned API endpoints
    path('api/v1/administrator/', include('administrators.urls',
                                          namespace='administrators')),
    path('api/v1/user/', include('users.urls', namespace='users')),
    path('api/v1/login/', TokenObtainPairView.as_view(),
         name='token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(),
         name='token_refresh'),
    path('api/v1/products/', include('products.urls', namespace='products')),
    path('api/v1/orders/', include('order.urls', namespace='order')),
    path('api/v1/payment/', include('payment.urls', namespace='payment')),
    path('api/v1/cart/', include('cart.urls', namespace='cart')),
    path('api/v1/checkout/', include('checkout.urls', namespace='checkout')),
    path('api/v1/wishlist/', include('wishlist.urls', namespace='wishlist')),
    path('api/v1/notifications/', include(
        'notifications.urls', namespace='notifications')
         ),
    path('api/v1/vendor/', include(('vendor.urls', 'vendor'),
                                   namespace='vendor')),
]
