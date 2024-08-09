"""
URL mapping for the administrator API.
"""

from django.urls import path, include

from rest_framework.routers import DefaultRouter

from . import views


app_name = 'administrators'

router = DefaultRouter()
router.register(
    r'customer-profiles',
    views.AdministratorCustomerProfileViewSet,
    basename='administrators_customer_profile'
)
router.register(
    r'users',
    views.AdministratorUserViewSet,
    basename='administrators_users'
)

urlpatterns = [
    path('', include(router.urls)),
]
