# notifications/urls.py

from django.urls import path
from .views import NotificationListView, NotificationDetailView

app_name = 'notifications'

urlpatterns = [
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<uuid:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
]
