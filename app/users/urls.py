"""
URL mapping for the user API.
"""

from django.urls import path
from . import views


app_name = 'users'
urlpatterns = [
    path('register/', views.CreateUserView.as_view(), name='register'),
    path('me/', views.ManageUserView.as_view(), name='me')
]
