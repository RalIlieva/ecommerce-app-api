# vendor/views/dashboard/vendor_dashboard_overview.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.contrib.auth.models import Group
from core.permissions import IsVendor
from order.models import Order
from products.models import Product
from payment.models import Payment
from order.serializers import OrderSerializer
from products.serializers import ProductMiniSerializer
from payment.serializers import PaymentSerializer


class VendorDashboardView(APIView):
    """
    Vendor Dashboard API view to aggregate all necessary data
    for the vendor in a single endpoint.
    """
    permission_classes = [permissions.IsAuthenticated, IsVendor]

    def get(self, request):
        # Get product-related data
        products = Product.objects.all()
        products_data = ProductMiniSerializer(
            products,
            many=True
        ).data

        # Get order-related data
        orders = Order.objects.all()
        orders_data = OrderSerializer(
            orders, many=True
        ).data

        # Get payment-related data
        payments = Payment.objects.all()
        payments_data = PaymentSerializer(
            payments,
            many=True
        ).data

        # Combine the data into a single response
        dashboard_data = {
            'products': products_data,
            'orders': orders_data,
            'payments': payments_data
        }

        return Response(dashboard_data)
