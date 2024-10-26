from django.urls import path
from .views import StartCheckoutSessionView, CompleteCheckoutView

app_name = 'checkout'

urlpatterns = [
    path('start/', StartCheckoutSessionView.as_view(), name='start-checkout'),
    path('complete/<uuid:checkout_session_uuid>/', CompleteCheckoutView.as_view(), name='complete-checkout'),
]
