"""
URL mapping for the user API.
"""

from django.urls import path

from . import views


app_name = 'users'

urlpatterns = [
    path('register/', views.RegisterUserView.as_view(), name='register'),
    path('me/', views.ManageUserView.as_view(), name='me'),
    # path('profile/',
    #      views.ManageCustomerProfileView.as_view(),
    #      name='customer_profile'),
    path('profile/<uuid:profile_uuid>/',
         views.ManageCustomerProfileByUUIDView.as_view(),
         name='customer_profile_uuid'),
    # path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
]
