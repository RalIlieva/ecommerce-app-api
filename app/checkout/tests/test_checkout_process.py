# checkout/tests/test_checkout_process.py

from unittest.mock import patch
from rest_framework import status
from rest_framework.response import Response
from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from products.models import Product, Category
from payment.models import Payment
from order.models import Order
from cart.models import Cart, CartItem
from cart.services import add_item_to_cart
from checkout.models import CheckoutSession, ShippingAddress
from stripe.error import StripeError
from rest_framework.exceptions import ValidationError
# from django.core.exceptions import ValidationError


class CheckoutTestCase(APITestCase):
    """
    Test case for various scenarios in the checkout process.
    This test suite verifies different aspects of the checkout process,
    such as initiating the checkout, handling errors, managing stock,
    preventing unauthorized access, and validating input.
    """

    def setUp(self):
        """
        Set up the environment for the checkout tests.
        Creates the necessary user, product, cart, cart items
        to be used in the test cases.
        Steps:
            - Create a test user and authenticate the user.
            - Create a category and a product for testing.
            - Add the product to a cart for the test user.
        """
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
        """
        Test a successful checkout initiation.
        Steps:
            - Mock the Stripe PaymentIntent creation to simulate the Stripe API
            - Initiate the checkout process with valid data.
            - Verify that a Payment object and CheckoutSession are created.
            - Assert the payment secret is returned correctly.
        Expected Outcome:
            - The checkout initiation should succeed.
            - PaymentIntent should be created with the correct parameters.
            - The response should include a 'payment_secret'.
        """
        # Configure the mock to return a fake PaymentIntent
        mock_payment_intent_create.return_value = {
            'id': 'pi_test',
            'client_secret': 'test_client_secret'
        }

        # Endpoint for initiating the checkout process
        url = reverse('checkout:start-checkout')

        # Create a ShippingAddress instance
        shipping_address = ShippingAddress.objects.create(
            user=self.user,  # Associate the shipping address with the current user
            full_name="Test User",
            address_line_1="789 Oak St",
            address_line_2="Apt 2",
            city="Test City",
            postal_code="12345",
            country="Test Country",
            phone_number="+359883368888"
        )

        # Make a POST request to start checkout
        response = self.client.post(
            url, format='json',
            # data={'shipping_address': str(shipping_address.id)}
            data={
                'shipping_address': {
                    'full_name': shipping_address.full_name,
                    'address_line_1': shipping_address.address_line_1,
                    'address_line_2': shipping_address.address_line_2,
                    'city': shipping_address.city,
                    'postal_code': shipping_address.postal_code,
                    'country': shipping_address.country,
                    'phone_number': str(shipping_address.phone_number)
                }
            }
        )

        # Debugging response if failure
        if response.status_code != status.HTTP_201_CREATED:
            print(f"Response Status Code: {response.status_code}")
            print(f"Response Data: {response.data}")

        # Check if response is successful
        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        # Verify the payment intent was created with the correct parameters
        order = Order.objects.get(user=self.user)
        mock_payment_intent_create.assert_called_once_with(
            amount=int(order.total_amount * 100),  # Amount in cents
            currency='usd',
            metadata={'order_uuid': order.uuid},
            payment_method_types=['card'],
            idempotency_key=f"order_{order.uuid}_payment"
        )

        # Verify that a Payment object was created
        payment = Payment.objects.filter(order=order).first()
        self.assertIsNotNone(payment)
        self.assertEqual(payment.stripe_payment_intent_id, "pi_test")
        self.assertEqual(payment.status, Payment.PENDING)
        self.assertEqual(payment.amount, 200.00)

        # Verify the CheckoutSession is correctly associated with Payment
        checkout_session = CheckoutSession.objects.get(user=self.user)
        self.assertEqual(checkout_session.payment, payment)
        self.assertEqual(checkout_session.status, 'IN_PROGRESS')

        # Verify that 'payment_secret' is included in the response
        self.assertIn('payment_secret', response.data)
        self.assertEqual(
            response.data['payment_secret'],
            'test_client_secret'
        )

    @patch('payment.services.stripe.PaymentIntent.create')
    def test_checkout_already_paid_order(
            self, mock_payment_intent_create
    ):
        """
        Test attempting to initiate checkout for an already existing session.
        Steps:
            - Initiate the checkout process.
            - Attempt to initiate checkout again with the same cart.
            - Assert that the second attempt fails with a 400 BAD REQUEST.
        Expected Outcome:
            - The first attempt should succeed, and the second should fail.
            - The error message should indicate the session already exists.
        """
        self.client.force_authenticate(user=self.user)
        # Configure the mock to return a fake PaymentIntent
        mock_payment_intent_create.return_value = {
            'id': 'pi_test',
            'client_secret': 'test_client_secret'
        }

        # Endpoint for initiating the checkout process
        url = reverse('checkout:start-checkout')

        # Create a ShippingAddress instance
        shipping_address = ShippingAddress.objects.create(
            user=self.user,  # Associate the shipping address with the current user
            full_name="Test User",
            address_line_1="789 Oak St",
            address_line_2="Apt 2",
            city="Test City",
            postal_code="12345",
            country="Test Country",
            phone_number="+359883368888"
        )

        # Make a POST request to start checkout
        response = self.client.post(
            url, format='json',
            # data={'shipping_address': str(shipping_address.id)}
            data={
                'shipping_address': {
                    'full_name': shipping_address.full_name,
                    'address_line_1': shipping_address.address_line_1,
                    'address_line_2': shipping_address.address_line_2,
                    'city': shipping_address.city,
                    'postal_code': shipping_address.postal_code,
                    'country': shipping_address.country,
                    'phone_number': str(shipping_address.phone_number)
                }
            }
        )

        # Assert that the response is successful
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Attempt to initiate checkout again for the same order
        response_duplicate = self.client.post(
            url, format='json',
            # data={'shipping_address': '123 Main St'}
            data={
                'shipping_address': {
                    'full_name': shipping_address.full_name,
                    'address_line_1': shipping_address.address_line_1,
                    'address_line_2': shipping_address.address_line_2,
                    'city': shipping_address.city,
                    'postal_code': shipping_address.postal_code,
                    'country': shipping_address.country,
                    'phone_number': str(shipping_address.phone_number)
                }
            }
        )

        # Assert that the response status is 400 BAD REQUEST
        self.assertEqual(
            response_duplicate.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        # Assert that the error message indicates the payment already exists
        self.assertEqual(
            response_duplicate.data['detail'],
            "Checkout session already exists for this cart."
        )

    @patch('payment.services.stripe.PaymentIntent.create')
    def test_checkout_with_missing_shipping_address(
            self, mock_payment_intent_create
    ):
        """
        Test attempt to initiate checkout without a shipping address.
        Expected Outcome:
            - The request should fail with a 400 BAD REQUEST.
            - The error message should indicate that
            the 'shipping_address' field is required.
        """
        # Configure the mock to return a fake PaymentIntent
        mock_payment_intent_create.return_value = {
            'id': 'pi_test',
            'client_secret': 'test_client_secret'
        }

        # Endpoint for initiating the checkout process
        url = reverse('checkout:start-checkout')

        # Make a POST request without shipping_address
        response = self.client.post(url, format='json', data={})

        # Assert that the response status is 400 BAD REQUEST
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Assert the error message indicates the shipping address is required
        self.assertIn('shipping_address', response.data['detail'])
        self.assertEqual(
            response.data['detail']['shipping_address'][0],
            'This field is required.'
        )

    @patch('payment.services.stripe.PaymentIntent.create')
    def test_payment_creation_stripe_error(self, mock_payment_intent_create):
        """
        Test handling a Stripe API error during payment intent creation.
        Expected Outcome:
            - The request should fail with a 400 BAD REQUEST.
            - No Payment object should be created.
        """
        # Configure the mock to raise a StripeError
        mock_payment_intent_create.side_effect = StripeError(
            "Stripe API error occurred."
        )

        # Endpoint for initiating the checkout process
        url = reverse('checkout:start-checkout')

        # Create a ShippingAddress instance
        shipping_address = ShippingAddress.objects.create(
            user=self.user,  # Associate the shipping address with the current user
            full_name="Test User",
            address_line_1="789 Oak St",
            address_line_2="Apt 2",
            city="Test City",
            postal_code="12345",
            country="Test Country",
            phone_number="+359883368888"
        )

        # Make a POST request to start checkout
        response = self.client.post(
            url, format='json',
            # data={'shipping_address': str(shipping_address.id)}
            data={
                'shipping_address': {
                    'full_name': shipping_address.full_name,
                    'address_line_1': shipping_address.address_line_1,
                    'address_line_2': shipping_address.address_line_2,
                    'city': shipping_address.city,
                    'postal_code': shipping_address.postal_code,
                    'country': shipping_address.country,
                    'phone_number': str(shipping_address.phone_number)
                }
            }
        )

        # Assert that the response status is 400 BAD REQUEST
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        # Assert the error message indicates a payment intent creation failure
        self.assertEqual(response.data['detail'],
                         "Stripe error: Stripe API error occurred."
                         )

        # Verify that no Payment object was created
        orders = Order.objects.filter(user=self.user)
        for order in orders:
            payment_exists = Payment.objects.filter(order=order).exists()
            self.assertFalse(payment_exists)

    @patch('payment.services.stripe.PaymentIntent.create')
    def test_duplicate_checkout_attempts(self, mock_payment_intent_create):
        """
        Test attempting multiple checkout initiations for the same cart.
        Steps:
            - Initiate the checkout process once.
            - Attempt to initiate checkout again for the same cart.
            - Assert the second attempt fails with a 400 BAD REQUEST status.
        Expected Outcome:
            - The first attempt to initiate checkout should succeed.
            - The second attempt should fail with an error indicating that
            a checkout session already exists for the cart.
            - Verify that PaymentIntent.create was called only once.
        """

        # Configure the mock to return a fake PaymentIntent
        mock_payment_intent_create.return_value = {
            'id': 'pi_test',
            'client_secret': 'test_client_secret'
        }

        # Endpoint for initiating the checkout process
        url = reverse('checkout:start-checkout')

        # Create a ShippingAddress instance
        shipping_address = ShippingAddress.objects.create(
            user=self.user,  # Associate the shipping address with the current user
            full_name="Test User",
            address_line_1="789 Oak St",
            address_line_2="Apt 2",
            city="Test City",
            postal_code="12345",
            country="Test Country",
            phone_number="+359883368888"
        )

        # First checkout attempt
        response_first = self.client.post(
            url, format='json',
            # data={'shipping_address': str(shipping_address.id)}
            data={
                'shipping_address': {
                    'full_name': shipping_address.full_name,
                    'address_line_1': shipping_address.address_line_1,
                    'address_line_2': shipping_address.address_line_2,
                    'city': shipping_address.city,
                    'postal_code': shipping_address.postal_code,
                    'country': shipping_address.country,
                    'phone_number': str(shipping_address.phone_number)
                }
            }
        )
        self.assertEqual(response_first.status_code, status.HTTP_201_CREATED)

        # Create a ShippingAddress instance
        shipping_address = ShippingAddress.objects.create(
            user=self.user,  # Associate the shipping address with the current user
            full_name="Test User",
            address_line_1="789 Oak St",
            address_line_2="Apt 2",
            city="Test City",
            postal_code="12345",
            country="Test Country",
            phone_number="+359883368888"
        )

        # Second checkout attempt with the same order
        response_second = self.client.post(
            url, format='json',
            # data={'shipping_address': str(shipping_address.id)}
            data={
                'shipping_address': {
                    'full_name': shipping_address.full_name,
                    'address_line_1': shipping_address.address_line_1,
                    'address_line_2': shipping_address.address_line_2,
                    'city': shipping_address.city,
                    'postal_code': shipping_address.postal_code,
                    'country': shipping_address.country,
                    'phone_number': str(shipping_address.phone_number)
                }
            }
        )

        # Assert that the second attempt fails due to existing payment
        self.assertEqual(
            response_second.status_code,
            status.HTTP_400_BAD_REQUEST
        )
        self.assertEqual(
            response_second.data['detail'],
            "Checkout session already exists for this cart."
        )

        # Assert that PaymentIntent.create was called only once
        mock_payment_intent_create.assert_called_once()

    @patch('payment.services.stripe.PaymentIntent.create')
    def test_stock_updates_after_checkout(self, mock_payment_intent_create):
        """
        Test the product stock updates correctly after a successful checkout.
        Expected Outcome:
            - The product stock should decrease by the purchased quantity.
        """
        # Configure the mock to return a fake PaymentIntent
        mock_payment_intent_create.return_value = {
            'id': 'pi_test',
            'client_secret': 'test_client_secret'
        }

        # Retrieve initial stock
        initial_stock = self.product.stock

        # Endpoint for initiating the checkout process
        url = reverse('checkout:start-checkout')

        # Create a ShippingAddress instance
        shipping_address = ShippingAddress.objects.create(
            user=self.user,  # Associate the shipping address with the current user
            full_name="Test User",
            address_line_1="789 Oak St",
            address_line_2="Apt 2",
            city="Test City",
            postal_code="12345",
            country="Test Country",
            phone_number="+359883368888"
        )

        # Make a POST request to start checkout
        response = self.client.post(
            url, format='json',
            # data={'shipping_address': str(shipping_address.id)}
            data={
                'shipping_address': {
                    'full_name': shipping_address.full_name,
                    'address_line_1': shipping_address.address_line_1,
                    'address_line_2': shipping_address.address_line_2,
                    'city': shipping_address.city,
                    'postal_code': shipping_address.postal_code,
                    'country': shipping_address.country,
                    'phone_number': str(shipping_address.phone_number)
                }
            }
        )

        # Assert that the response is successful
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Refresh the product instance from the database
        self.product.refresh_from_db()

        # Calculate expected stock after purchase (quantity=2)
        expected_stock = initial_stock - 2

        # Assert that the stock has been updated correctly
        self.assertEqual(self.product.stock, expected_stock)

    @patch('payment.services.stripe.PaymentIntent.create')
    def test_checkout_requires_authentication(
            self, mock_payment_intent_create
    ):
        """
        Test attempting to initiate checkout without being authenticated.
        Steps:
            - Log out the user to simulate an unauthenticated request.
            - Attempt to initiate checkout.

        Expected Outcome:
            - The request should fail with a 401 UNAUTHORIZED status.
            - The error message should indicate authentication is required.
        """
        # Configure the mock to return a fake PaymentIntent
        mock_payment_intent_create.return_value = {
            'id': 'pi_test',
            'client_secret': 'test_client_secret'
        }

        # Logout the user to simulate an unauthenticated request
        self.client.logout()

        # Endpoint for initiating the checkout process
        url = reverse('checkout:start-checkout')

        # Make a POST request to start checkout
        response = self.client.post(
            url, format='json',
            data={'shipping_address': '123 Main St'}
        )

        # Assert that the response status is 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Optionally, assert the error message
        self.assertEqual(
            response.data['detail'],
            "Authentication credentials were not provided."
        )

    @patch('payment.services.stripe.PaymentIntent.create')
    def test_checkout_with_insufficient_stock(
            self, mock_payment_intent_create
    ):
        """
        Test initiating checkout when the cart contains
        items with insufficient stock.
        Steps:
            - Set the product stock to a value lower
            than the cart quantity.
            - Attempt to initiate checkout.
        Expected Outcome:
            - The request should fail with a 400 BAD REQUEST status.
            - The error message should indicate that
            there is not enough stock available.
        """
        # Configure the mock to return a fake PaymentIntent
        mock_payment_intent_create.return_value = {
            'id': 'pi_test',
            'client_secret': 'test_client_secret'
        }

        # Set product stock to 1, less than the cart quantity of 2
        self.product.stock = 1
        self.product.save()

        # Endpoint for initiating the checkout process
        url = reverse('checkout:start-checkout')

        # Create a ShippingAddress instance
        shipping_address = ShippingAddress.objects.create(
            user=self.user,  # Associate the shipping address with the current user
            full_name="Test User",
            address_line_1="789 Oak St",
            address_line_2="Apt 2",
            city="Test City",
            postal_code="12345",
            country="Test Country",
            phone_number="+359883368888"
        )

        # Make a POST request to start checkout
        response = self.client.post(
            url, format='json',
            # data={'shipping_address': str(shipping_address.id)}
            data={
                'shipping_address': {
                    'full_name': shipping_address.full_name,
                    'address_line_1': shipping_address.address_line_1,
                    'address_line_2': shipping_address.address_line_2,
                    'city': shipping_address.city,
                    'postal_code': shipping_address.postal_code,
                    'country': shipping_address.country,
                    'phone_number': str(shipping_address.phone_number)
                }
            }
        )

        # Assert that the response status is 400 BAD REQUEST
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Assert the error message indicates insufficient stock -
        # checkout views and core exception
        self.assertEqual(
            response.data['detail'],
            "Not enough stock available"
        )

    def test_add_item_with_invalid_quantity(self):
        """
        Test adding an item to the cart with an invalid quantity.
        Steps:
            - Add an item with a quantity of 0.
            - Add an item with a negative quantity.
        Expected Outcome:
            - Adding an item with a quantity of 0 or
            less should raise a ValidationError.
            - The error message should indicate that
            the quantity must be greater than zero.
        """
        # Add a CartItem with quantity 0 using the service function
        with self.assertRaises(ValidationError) as context:
            add_item_to_cart(
                user=self.user,
                product_uuid=self.product.uuid,
                quantity=0
            )

        # Extract the error detail from the exception
        error_detail = context.exception.detail
        # Assert that the ValidationError message is as expected
        self.assertIn(
            'Quantity must be greater than zero.',
            str(error_detail[0])
        )

        # Add a CartItem with negative quantity via the service function
        with self.assertRaises(ValidationError) as context_neg:
            add_item_to_cart(
                user=self.user,
                product_uuid=self.product.uuid,
                quantity=-1
            )

        # Extract the error detail from the exception
        error_detail_neg = context_neg.exception.detail
        # Assert that the ValidationError message is as expected
        self.assertIn(
            'Quantity must be greater than zero.',
            str(error_detail_neg[0])
        )

    @patch('payment.services.stripe.PaymentIntent.create')
    def test_checkout_with_invalid_data_types(
            self, mock_payment_intent_create
    ):
        """
        Test initiating checkout with invalid data types.
        Steps:
            - Provide an integer for 'shipping_address'
            instead of a string.
            - Attempt to initiate checkout.
        Expected Outcome:
            - The request should fail with a 400 BAD REQUEST status.
            - The error message should indicate that
            the 'shipping_address' is invalid.
        """
        # Configure the mock to return a fake PaymentIntent
        mock_payment_intent_create.return_value = {
            'id': 'pi_test',
            'client_secret': 'test_client_secret'
        }

        # Endpoint for initiating the checkout process
        url = reverse('checkout:start-checkout')

        # Sample new shipping address data
        invalid_address = {
            "full_name": "John Doe",
            "address_line_1": "1234",
            "address_line_2": "567",
            "city": "89",
            "postal_code": "10001",
            "country": "USA",
            "phone_number": "+359883368888"
        }

        # Make a POST request with invalid data types
        # An integer for 'shipping_address' instead of a string
        response = self.client.post(
            url, format='json',
            data={"new_shipping_address": invalid_address}
        )

        # Assert that the response status is 400 BAD REQUEST
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Assert the error message indicates the shipping address type er
        self.assertIn('new_shipping_address', response.data['detail'])
        self.assertEqual(
            response.data['detail']['new_shipping_address']['address_line_1'][0],
            'Shipping address cannot be purely numeric.'
        )

    @patch('payment.services.stripe.PaymentIntent.create')
    def test_checkout_with_new_shipping_address(
            self, mock_payment_intent_create
    ):
        """
        Test initiating checkout with a new shipping address.
        Steps:
            - Provide a complete new shipping address in the request.
            - Attempt to initiate checkout.
        Expected Outcome:
            - The checkout session is successfully created.
            - The response should contain the new shipping address.
        """
        # Mock the Stripe PaymentIntent creation
        mock_payment_intent_create.return_value = {
            'id': 'pi_test',
            'client_secret': 'test_client_secret'
        }

        # Endpoint for initiating the checkout process
        url = reverse('checkout:start-checkout')

        # Sample new shipping address data
        new_shipping_address_data = {
            "full_name": "John Doe",
            "address_line_1": "123 Elm Street",
            "address_line_2": "Apt 5B",
            "city": "New York",
            "postal_code": "10001",
            "country": "USA",
            "phone_number": "+359883368888"
        }

        # Make a POST request with new shipping address
        response = self.client.post(
            url,
            format='json',
            data={
                "new_shipping_address": new_shipping_address_data
            }
        )

        print("Response Status Code:", response.status_code)
        print("Response Data:", response.data)

        # Assert that the response status is 201 CREATED
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Assert that the response contains the shipping address details
        self.assertIn("shipping_address", response.data)
        self.assertIsNotNone(response.data["shipping_address"])  # Ensure it's not None
        self.assertEqual(response.data["shipping_address"]["full_name"], "John Doe")
        self.assertEqual(response.data["shipping_address"]["address_line_1"], "123 Elm Street")
        self.assertEqual(response.data["shipping_address"]["city"], "New York")

    def test_access_another_users_order(self):
        """
        Test attempting to access another user's checkout session.
        Steps:
            - Create another user and their cart, order, and payment.
            - Initiate checkout for the other user's cart.
            - Attempt to access the other user's checkout session
            while authenticated as self.user.

        Expected Outcome:
            - The request should fail with a 403 FORBIDDEN or
            404 NOT FOUND status.
            - The error message should indicate
            the user does not have access to the checkout session.
        """
        # Create another user and their cart
        other_user = get_user_model().objects.create_user(
            email="otheruser@example.com", password="password123"
        )
        other_cart = Cart.objects.create(user=other_user)
        CartItem.objects.create(
            cart=other_cart, product=self.product, quantity=1
        )

        # Create a ShippingAddress instance
        shipping_address = ShippingAddress.objects.create(
            user=other_user,
            full_name="Test Other User",
            address_line_1="Somewhere",
            address_line_2="Somewhere 2",
            city="Lala",
            postal_code="12345",
            country="CountryName",
            phone_number="+359883368888"
        )

        # Initiate checkout for the other user's cart
        from payment.services import create_payment_intent
        from order.services import create_order

        # Create an order for the other user
        order = create_order(user=other_user, items_data=[
            {'product': self.product.uuid, 'quantity': 1}
        ])

        # Create a payment intent for that order
        create_payment_intent(order_uuid=order.uuid, user=other_user)

        # Retrieve the payment object associated with the order
        payment = Payment.objects.get(order=order)

        # Create the checkout session manually
        # since it's not created automatically
        checkout_session = CheckoutSession.objects.create(
            user=other_user,
            cart=other_cart,
            payment=payment,
            shipping_address=shipping_address,
            status='IN_PROGRESS'
        )

        # URL for completing the checkout session
        url = reverse(
            'checkout:complete-checkout',
            kwargs={'checkout_session_uuid': checkout_session.uuid}
        )

        # Authenticate as self.user and attempt to
        # access another user's checkout session
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            url,
            format='json',
            data={'payment_status': 'SUCCESS'}
        )

        # Assert that the response status is 404 NOT FOUND or 403 FORBIDDEN
        self.assertIn(
            response.status_code,
            [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]
        )

        # Assert appropriate error message
        self.assertIn('detail', response.data)
