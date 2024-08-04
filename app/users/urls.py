"""
URL mapping for the user API.
"""

from django.urls import path
from . import views


app_name = 'users'
urlpatterns = [
    path('create/', views.CreateUserView.as_view(), name='create'),
    path('me/', views.ManageUserView.as_view(), name='me')
]
