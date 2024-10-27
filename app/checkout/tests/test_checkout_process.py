# checkout/tests/test_checkout_process.py

from unittest.mock import patch
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from products.models import Product, Category
from payment.models import Payment
from order.models import Order
from cart.models import Cart, CartItem
from checkout.models import CheckoutSession

class CheckoutTestCase(APITestCase):

    def setUp(self):
        # Create test user
        self.user = get_user_model().objects.create_user(
            email="testuser@example.com", password="password123"
        )
        # Authenticate user
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # Create category and product for the order
        self.category = Category.objects.create(name="Test Category")
        self.product = Product.objects.create(
            name="Test Product", price=100.00, stock=10, category=self.category
        )

        # Create a cart and add items
        self.cart = Cart.objects.create(user=self.user)
        self.cart_item = CartItem.objects.create(
            cart=self.cart, product=self.product, quantity=2
        )

    @patch('payment.services.stripe.PaymentIntent.create')
    def test_successful_checkout(self, mock_payment_intent_create):
        # Configure the mock to return a fake PaymentIntent
        mock_payment_intent_create.return_value = {
            'id': 'pi_test',
            'client_secret': 'test_client_secret'
        }

        # Endpoint for initiating the checkout process
        url = reverse('checkout:start-checkout')

        # Make a POST request to start checkout
        response = self.client.post(url, format='json', data={'shipping_address': '123 Main St'})

        # Debugging response if failure
        if response.status_code != status.HTTP_201_CREATED:
            print(f"Response Status Code: {response.status_code}")
            print(f"Response Data: {response.data}")

        # Check if response is successful
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify that the payment intent was created with the correct parameters
        order = Order.objects.get(user=self.user)
        mock_payment_intent_create.assert_called_once_with(
            amount=int(order.total_amount * 100),  # Amount in cents
            currency='usd',
            metadata={'order_id': order.id},
            payment_method_types=['card'],
            idempotency_key=f"order_{order.id}_payment"
        )

        # Verify that a Payment object was created
        payment = Payment.objects.filter(order=order).first()
        self.assertIsNotNone(payment)
        self.assertEqual(payment.stripe_payment_intent_id, "pi_test")
        self.assertEqual(payment.status, Payment.PENDING)
        self.assertEqual(payment.amount, 200.00)

        # Verify that the CheckoutSession is correctly associated with the Payment
        checkout_session = CheckoutSession.objects.get(user=self.user)
        self.assertEqual(checkout_session.payment, payment)
        self.assertEqual(checkout_session.status, 'IN_PROGRESS')


# from unittest.mock import patch, ANY
# from rest_framework import status
# from rest_framework.test import APITestCase, APIClient
# from unittest.mock import patch
# from django.urls import reverse
# from django.contrib.auth import get_user_model
# from products.models import Product, Category
# from payment.models import Payment
# from order.models import Order
# from cart.models import Cart, CartItem
# from checkout.models import CheckoutSession
#
#
# class CheckoutTestCase(APITestCase):
#
#     def setUp(self):
#         # Create test user
#         self.user = get_user_model().objects.create_user(
#             email="testuser@example.com", password="password123"
#         )
#         # Authenticate user
#         self.client = APIClient()
#         self.client.force_authenticate(user=self.user)
#
#         # Create category and product for the order
#         self.category = Category.objects.create(name="Test Category")
#         self.product = Product.objects.create(
#             name="Test Product", price=100.00, stock=10, category=self.category
#         )
#
#         # Create a cart and add items
#         self.cart = Cart.objects.create(user=self.user)
#         self.cart_item = CartItem.objects.create(
#             cart=self.cart, product=self.product, quantity=2
#         )
#
#     @patch('payment.services.create_payment_intent')
#     def test_successful_checkout(self, mock_create_payment_intent):
#         # Mock the payment intent creation
#         mock_create_payment_intent.return_value = "test_client_secret"
#
#         # Endpoint for initiating the checkout process
#         url = reverse('checkout:start-checkout')
#
#         # Make a POST request to start checkout
#         response = self.client.post(url, format='json', data={'shipping_address': '123 Main St'})
#
#         # Debugging response if failure
#         if response.status_code != status.HTTP_201_CREATED:
#             print(f"Response Status Code: {response.status_code}")
#             print(f"Response Data: {response.data}")
#
#         # Check if response is successful
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#
#         # Verify that the payment intent was created
#         mock_create_payment_intent.assert_called_once_with(
#             order_id=ANY,  # Because the order is created dynamically
#             user=self.user
#         )
#
#     @patch('payment.services.update_payment_status')
#     def test_complete_checkout(self, mock_update_payment_status):
#         # Mock a payment secret
#         payment_secret = 'test_client_secret'
#
#         # Create a checkout session manually to be completed later
#         checkout_session = CheckoutSession.objects.create(
#             user=self.user,
#             cart=self.cart,
#             shipping_address='123 Main St',
#             status='IN_PROGRESS'
#         )
#
#         # Create an order linked to the cart for testing
#         order = Order.objects.create(user=self.user, status=Order.PENDING)
#         payment = Payment.objects.create(order=order, user=self.user, amount=self.cart.get_total(), status='PENDING')
#         checkout_session.payment = payment
#         checkout_session.save()
#
#         # Endpoint for completing the checkout
#         url = reverse('checkout:complete-checkout', kwargs={'checkout_session_uuid': checkout_session.uuid})
#
#         # Simulate successful payment from frontend
#         data = {'payment_status': 'SUCCESS'}
#         response = self.client.post(url, data, format='json')
#
#         # Check if response is successful
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#
#         # Verify that an order was created
#         order = Order.objects.filter(user=self.user).first()
#         self.assertIsNotNone(order)

    # def test_checkout_with_empty_cart(self):
    #     # Empty the cart first
    #     CartItem.objects.all().delete()
    #
    #     # Attempt to checkout
    #     url = reverse('checkout:checkout')
    #     response = self.client.post(url, format='json')
    #
    #     # Should return a bad request since the cart is empty
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertIn("Cart is empty", response.data['detail'])
    #
    # def test_checkout_with_insufficient_stock(self):
    #     # Set the product stock less than the cart quantity
    #     self.product.stock = 1
    #     self.product.save()
    #
    #     # Attempt to checkout
    #     url = reverse('checkout:checkout')
    #     response = self.client.post(url, format='json')
    #
    #     # Should return a bad request due to insufficient stock
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertIn("Not enough stock available", response.data['detail'])
    #
    # def test_unauthorized_checkout_access(self):
    #     # Log out user to make them unauthenticated
    #     self.client.logout()
    #
    #     # Attempt to checkout
    #     url = reverse('checkout:checkout')
    #     response = self.client.post(url, format='json')
    #
    #     # Should return unauthorized since the user is not logged in
    #     self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    #
    # @patch('checkout.services.create_payment_intent')
    # def test_checkout_payment_failure(self, mock_create_payment_intent):
    #     # Simulate a payment error
    #     mock_create_payment_intent.side_effect = Exception("Payment failed")
    #
    #     # Attempt to checkout
    #     url = reverse('checkout:checkout')
    #     response = self.client.post(url, format='json')
    #
    #     # Should return a server error due to payment failure
    #     self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
    #     self.assertIn("Payment failed", response.data['detail'])
    #
    # @patch('checkout.services.create_payment_intent')
    # def test_cart_clearing_after_successful_checkout(self, mock_create_payment_intent):
    #     # Mock the payment intent creation
    #     mock_create_payment_intent.return_value = "test_client_secret"
    #
    #     # Endpoint for initiating the checkout process
    #     url = reverse('checkout:checkout')
    #
    #     # Make a POST request to checkout
    #     response = self.client.post(url, format='json')
    #
    #     # Check if response is successful
    #     self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    #
    #     # Verify that cart items are cleared
    #     self.assertEqual(CartItem.objects.filter(cart=self.cart).count(), 0)
    #
    #     # Verify that an order is created
    #     order = Order.objects.filter(user=self.user).first()
    #     self.assertIsNotNone(order)
    #     self.assertEqual(order.status, Order.PENDING)
    #