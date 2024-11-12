"""
URL mappings for the notification app.
"""

from django.urls import path
from .views import NotificationListView, NotificationDetailView

app_name = 'notifications'

urlpatterns = [
    path(
        'notifications/',
        NotificationListView.as_view(),
        name='notification-list'
    ),
    path(
        'notifications/<uuid:uuid>/',
        NotificationDetailView.as_view(),
        name='notification-detail'
    ),
]
