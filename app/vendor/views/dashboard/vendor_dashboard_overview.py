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
        # Calculating totals for the vendor's dashboard overview
        total_products = Product.objects.count()
        total_orders = Order.objects.count()
        # total_revenue = Payment.objects.filter(status="completed").aggregate(
        #     total_revenue=models.Sum('amount')
        # )['total_revenue'] or 0.0

        response_data = {
            'total_products': total_products,
            'total_orders': total_orders,
            # 'total_revenue': total_revenue,
            'products': Product.objects.all().values('id', 'uuid', 'name', 'price', 'slug', 'category'),
            'orders': Order.objects.all().values('id', 'uuid', 'user', 'status', 'created', 'modified'),
            'payments': Payment.objects.filter(status="completed").values('id', 'uuid', 'order', 'amount', 'status'),
        }

        return Response(response_data, status=200)

    # def get(self, request):
    #     # Get product-related data
    #     products = Product.objects.all()
    #     products_data = ProductMiniSerializer(
    #         products,
    #         many=True
    #     ).data
    #
    #     # Get order-related data
    #     orders = Order.objects.all()
    #     orders_data = OrderSerializer(
    #         orders, many=True
    #     ).data
    #
    #     # Get payment-related data
    #     payments = Payment.objects.all()
    #     payments_data = PaymentSerializer(
    #         payments,
    #         many=True
    #     ).data
    #
    #     # Combine the data into a single response
    #     dashboard_data = {
    #         'products': products_data,
    #         'orders': orders_data,
    #         'payments': payments_data
    #     }
    #
    #     return Response(dashboard_data)
