from .customer_views import (
    OrderListView,
    OrderCreateView,
    OrderDetailView,
    OrderCancelView
)
from .admin_views import (
    AdminOrderListView,
    AdminOrderDetailView,
)


__all__ = [
    'OrderListView',
    'OrderCreateView',
    'OrderDetailView',
    'OrderCancelView',
    'AdminOrderListView',
    'AdminOrderDetailView'
]
