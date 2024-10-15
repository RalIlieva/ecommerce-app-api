from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from uuid import uuid4
from order.models import (
    Order,
    OrderItem
)
from products.models import Product, Category
from order.services import (
    create_order,
    update_order_status
)

ORDERS_URL = reverse('order:order-list')
ORDER_CREATE_URL = reverse('order:order-create')


def detail_url(order_uuid):
    """
    Create and return an order detail URL with UUID.
    """
    return reverse('order:order-detail', args=[order_uuid])


# class OrderListViewTests(TestCase):
#     def setUp(self):
#         self.client = APIClient()
#         self.user = get_user_model().objects.create_user(
#             email='user@example.com', password='password123'
#         )
#         self.other_user = get_user_model().objects.create_user(
#             email='otheruser@example.com', password='password123'
#         )
#         self.category = Category.objects.create(
#             name='Electronics',
#             slug='electronics'
#         )
#         self.product = Product.objects.create(
#             name='Test Product', description='A great product', price=100.00,
#             category=self.category, stock=10, slug='test-product'
#         )
#         self.order1 = create_order(
#             self.user,
#             [{'product': self.product, 'quantity': 2}]
#         )
#         self.order2 = create_order(
#             self.other_user,
#             [{'product': self.product, 'quantity': 1}]
#         )
#         self.client.force_authenticate(self.user)
#
#     def test_list_orders_for_authenticated_user(self):
#         response = self.client.get(ORDERS_URL)
#
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(Order.objects.filter(user=self.user).count(), 1)
#         self.assertEqual(
#             response.data['results'][0]['uuid'],
#             str(self.order1.uuid)
#         )
#         self.assertEqual(len(response.data['results']), 1)
#
#     def test_list_orders_for_unauthenticated_user(self):
#         self.client.force_authenticate(user=None)  # Unauthenticate the client
#         response = self.client.get(ORDERS_URL)
#
#         self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class OrderCreateViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            email='user@example.com', password='password123'
        )
        self.category = Category.objects.create(
            name='Electronics',
            slug='electronics'
        )
        self.product = Product.objects.create(
            name='Test Product', description='A great product', price=100.00,
            category=self.category, stock=10, slug='test-product'
        )
        self.client.force_authenticate(self.user)

    def test_authenticated_user_can_access_order_create(self):
        # Check if authenticated user can access the view
        # response = self.client.get(ORDER_CREATE_URL)
        response = self.client.post(ORDER_CREATE_URL, {})
        self.assertNotEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_order_with_valid_data(self):
        # url = '/api/orders/create/'
        self.client.force_authenticate(self.user)
        print("Resolved ORDER_CREATE_URL:", ORDER_CREATE_URL)
        payload = {
            'items': [{'product': self.product.uuid, 'quantity': 2}]
        }
        response = self.client.post(ORDER_CREATE_URL, payload, format='json')
        print("Response status:", response.status_code)
        if hasattr(response, 'data'):
            print("Response data:", response.data)
        else:
            print("Response content:", response.content)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(OrderItem.objects.count(), 1)
        order = Order.objects.get()
        self.assertEqual(order.order_items.first().product, self.product)
        self.assertEqual(order.order_items.first().quantity, 2)

    # def test_create_order_with_insufficient_stock(self):
    #     url = '/api/orders/create/'
    #     payload = {
    #         'items': [{'product': self.product.uuid, 'quantity': 20}]  # More than available stock
    #     }
    #     response = self.client.post(url, payload, format='json')
    #
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertIn('Not enough stock available', response.data['results'][0]['detail'])
    #     self.assertEqual(Order.objects.count(), 0)
    #
    # def test_create_order_with_invalid_product_uuid(self):
    #     url = '/api/orders/create/'
    #     invalid_uuid = uuid4()
    #     payload = {
    #         'items': [{'product': invalid_uuid, 'quantity': 1}]
    #     }
    #     response = self.client.post(url, payload, format='json')
    #
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertIn('Invalid product UUID', response.data['results'][0]['detail'])
    #     self.assertEqual(Order.objects.count(), 0)


class OrderDetailViewTests(TestCase):
    def setUp(self):
        # Set up the API client and users
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            email='user@example.com', password='password123'
        )
        self.other_user = get_user_model().objects.create_user(
            email='otheruser@example.com', password='password123'
        )

        # Create a category and a product
        self.category = Category.objects.create(
            name='Electronics',
            slug='electronics'
        )
        self.product = Product.objects.create(
            name='Test Product', description='A great product', price=100.00,
            category=self.category, stock=10, slug='test-product'
        )

        # Create an order for the user
        self.order = create_order(
            self.user, [{'product': self.product.uuid, 'quantity': 2}]
        )
        self.client.force_authenticate(self.user)

    def test_retrieve_order_with_valid_uuid(self):
        # Test retrieving the order using a valid UUID
        url = detail_url(self.order.uuid)
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['uuid'], str(self.order.uuid))
        self.assertEqual(response.data['user'], self.user.id)
        self.assertEqual(response.data['status'], 'pending')

    def test_retrieve_order_with_invalid_uuid(self):
        # Test retrieving an order with an invalid UUID
        invalid_uuid = uuid4()  # Generates a new UUID
        url = detail_url(invalid_uuid)
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_retrieve_order_forbidden_to_other_user(self):
        # Authenticate as a different user and attempt to retrieve the order
        self.client.force_authenticate(self.other_user)
        url = detail_url(self.order.uuid)
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_order_status_with_valid_uuid(self):
        # Test updating the order status with a valid UUID
        url = detail_url(self.order.uuid)
        response = self.client.patch(url, {'status': 'shipped'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'shipped')

    def test_update_order_status_with_invalid_uuid(self):
        # Test updating the order status with an invalid UUID
        invalid_uuid = uuid4()  # Generates a new UUID
        url = detail_url(invalid_uuid)
        response = self.client.patch(url, {'status': 'shipped'})

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_order_status_forbidden_to_other_user(self):
        # Authenticate as a diff user & attempt to update the order status
        self.client.force_authenticate(self.other_user)
        url = detail_url(self.order.uuid)
        response = self.client.patch(url, {'status': 'shipped'})

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
