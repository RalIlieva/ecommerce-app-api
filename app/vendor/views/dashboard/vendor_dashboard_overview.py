# vendor/views/dashboard/vendor_dashboard_overview.py

from rest_framework import serializers
from drf_spectacular.utils import extend_schema
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from core.permissions import IsVendor
from order.models import Order
from products.models import Product
from payment.models import Payment


class VendorDashboardSerializer(serializers.Serializer):
    total_products = serializers.IntegerField()
    total_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    products = serializers.ListField(child=serializers.DictField())
    orders = serializers.ListField(child=serializers.DictField())
    payments = serializers.ListField(child=serializers.DictField())


@extend_schema(
    responses={200: VendorDashboardSerializer}
)
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
        # Calculate total revenue for all completed payments
        total_revenue = Payment.objects.filter(status="completed").aggregate(
            total_revenue=Sum('amount')
        )['total_revenue'] or 0.0

        response_data = {
            'total_products': total_products,
            'total_orders': total_orders,
            'total_revenue': total_revenue,
            'products': Product.objects.all().values(
                'id', 'uuid',
                'name',
                'price',
                'slug',
                'category'
            ),
            'orders': Order.objects.all().values(
                'id', 'uuid',
                'user',
                'status',
                'created',
                'modified'
            ),
            'payments': Payment.objects.filter(
                status="completed"
            ).values(
                'id', 'uuid',
                'order',
                'amount',
                'status'
            ),
        }

        return Response(response_data, status=200)
