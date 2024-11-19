from rest_framework import generics, permissions
from django.contrib.auth.models import Group
from core.permissions import IsVendor
from payment.models import Payment
from payment.serializers import PaymentSerializer


class VendorPaymentListView(generics.ListAPIView):
    """
    View payments related to vendor products.
    """
    permission_classes = [permissions.IsAuthenticated, IsVendor]
    serializer_class = PaymentSerializer

    def get_queryset(self):
        # For a single-vendor system, return all payments
        return Payment.objects.all()
