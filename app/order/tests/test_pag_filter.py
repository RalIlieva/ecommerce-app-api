from django.urls import reverse
from rest_framework import status
from order.models import Order
from order.services import create_order
from .test_base import OrderTestBase

ORDERS_URL = reverse('order:order-list')
ORDER_CREATE_URL = reverse('order:order-create')


class OrderCreationTestCase(OrderTestBase):
    """
    Test suite for creating orders using Order Create View.
    """

    def test_create_order_with_valid_data(self):
        """
        Test creating an order with valid data.
        """
        payload = {
            'items': [{'product': str(self.product.uuid), 'quantity': 2}],
            'new_shipping_address': {
                'full_name': "Test User",
                'address_line_1': "123 Test Street",
                'address_line_2': "Apt 1",
                'city': "Test City",
                'postal_code': "12345",
                'country': "Testland",
                'phone_number': "+359883368888"
            }
        }
        response = self.client.post(ORDER_CREATE_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)

    def test_list_orders_pagination(self):
        """
        Test that the order list API supports pagination.
        """
        # Create several orders
        for _ in range(15):
            self.create_order(
                self.user,
                [{'product': self.product.uuid, 'quantity': 1}]
            )

        response = self.client.get(ORDERS_URL + '?page=1&page_size=10')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 10)  # Page size of 10

    def test_list_orders_filter_status(self):
        """Test filtering orders by status."""
        shipped_order = create_order(
            self.user,
            [{'product': self.product.uuid, 'quantity': 1}]
        )
        shipped_order.status = Order.SHIPPED
        shipped_order.save()

        response = self.client.get(ORDERS_URL + '?status=shipped')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(
            response.data['results'][0]['uuid'],
            str(shipped_order.uuid)
        )
