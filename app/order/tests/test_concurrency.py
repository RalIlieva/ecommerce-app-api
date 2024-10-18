# from threading import Thread
# from django.urls import reverse
# from rest_framework import status
# from order.models import Order
# from .test_base import OrderTestBase
#
# ORDERS_URL = reverse('order:order-list')
# ORDER_CREATE_URL = reverse('order:order-create')
#
#
# class OrderCreationTestCase(OrderTestBase):
#     """Test suite for creating orders using Order Create View."""
#
#     def test_create_order_with_valid_data(self):
#         """Test creating an order with valid data."""
#         payload = {
#             'items': [{'product': str(self.product.uuid), 'quantity': 2}]
#         }
#         response = self.client.post(ORDER_CREATE_URL, payload, format='json')
#
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         self.assertEqual(Order.objects.count(), 1)
#
#     def test_prevent_overselling(self):
#         """Test that overselling is prevented when two users attempt to buy the same product simultaneously."""
#
#         def place_order():
#             payload = {
#                 'items': [{'product': str(self.product.uuid), 'quantity': 5}]
#             }
#             response = self.client.post(ORDER_CREATE_URL, payload, format='json')
#             return response
#
#         # Stock is 10, so two simultaneous orders of 5 should succeed, but no more
#         thread1 = Thread(target=place_order)
#         thread2 = Thread(target=place_order)
#
#         thread1.start()
#         thread2.start()
#
#         thread1.join()
#         thread2.join()
#
#         self.assertEqual(Order.objects.count(), 2)
#         self.product.refresh_from_db()
#         self.assertEqual(self.product.stock, 0)
