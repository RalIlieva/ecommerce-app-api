"""
URL mapping for the user API.
"""

from django.urls import path, include

from rest_framework.routers import DefaultRouter

from . import views


app_name = 'users'

router = DefaultRouter()
router.register(
    r'admin/customer-profiles',
    views.AdminCustomerProfileViewSet,
    basename='admin_customer_profile'
)

urlpatterns = [
    path('register/', views.RegisterUserView.as_view(), name='register'),
    path('me/', views.ManageUserView.as_view(), name='me'),
    path('profile/',
         views.ManageCustomerProfileView.as_view(),
         name='customer_profile'),
    path('', include(router.urls)),
]
