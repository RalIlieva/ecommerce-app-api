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
    path('api/administrator/', include('administrators.urls')),
    path('api/user/', include('users.urls')),
    path('api/login/', TokenObtainPairView.as_view(),
         name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(),
         name='token_refresh'),
    path('api/products/', include('products.urls', namespace='products')),
    path('api/orders/', include('order.urls', namespace='order')),
    path('payment/', include('payment.urls', namespace='payment')),
    path('cart/', include('cart.urls', namespace='cart')),
    path('checkout/', include('checkout.urls', namespace='checkout')),
    path('wishlist/', include('wishlist.urls', namespace='wishlist')),
    path('notifications/', include(
        'notifications.urls', namespace='notifications')
         )
]
