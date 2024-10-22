from django.urls import path
from .views import CreatePaymentView, stripe_webhook

urlpatterns = [
    path('create-payment/', CreatePaymentView.as_view(), name='create-payment'),
    path('webhook/', stripe_webhook, name='stripe-webhook'),
]
