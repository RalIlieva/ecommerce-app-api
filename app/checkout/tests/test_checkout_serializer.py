from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from products.models import Product, Category
from cart.models import Cart, CartItem
from checkout.models import CheckoutSession, ShippingAddress
from checkout.serializers import CheckoutSessionSerializer


class CheckoutSessionSerializerTestCase(APITestCase):
    """
    Test case for the CheckoutSessionSerializer.

    This suite ensures that the CheckoutSessionSerializer handles
    data correctly during validation and serialization.
    It validates that the serializer correctly requires fields,
    and serializes data in the expected format.
    """

    def setUp(self):
        """
        Set up the environment for the test.

        Creates a test user, product, category, cart, and checkout session.
        These objects are required to validate the behavior of the serializer.

        Steps:
            - Create a test user.
            - Create a category and product for the user's cart.
            - Add the product to the user's cart.
            - Create a checkout session for the user.
        """

        # Create test user
        self.user = get_user_model().objects.create_user(
            email="testuser@example.com", password="password123"
        )

        # Create category and product for the cart
        self.category = Category.objects.create(name="Test Category")
        self.product = Product.objects.create(
            name="Test Product", price=100.00, stock=10, category=self.category
        )

        # Create a cart and add items
        self.cart = Cart.objects.create(user=self.user)
        self.cart_item = CartItem.objects.create(
            cart=self.cart, product=self.product, quantity=2
        )

        # Create a ShippingAddress instance
        self.shipping_address = ShippingAddress.objects.create(
            user=self.user,
            full_name="Test Other User",
            address_line_1="Somewhere",
            address_line_2="Somewhere 2",
            city="Lala",
            postal_code="12345",
            country="CountryName",
            phone_number="+359883368888"
        )

        # Create a checkout session
        self.checkout_session = CheckoutSession.objects.create(
            user=self.user,
            cart=self.cart,
            shipping_address=self.shipping_address,
            status='IN_PROGRESS'
        )

    def test_serializer_validation_missing_fields(self):
        """
        Test validation for missing fields in CheckoutSessionSerializer.
        This test ensures that the serializer correctly handles the absence of
        required fields such as `user` and `shipping_address`.

        Steps:
            - Try to serialize CheckoutSession instance without required fields
            - Validate that the serializer marks the missing fields as invalid

        Expected Outcome:
            - The serializer should not be valid.
            - The 'shipping_address' field should be present in the errors.
        """
        # Attempt to serialize a CheckoutSession without required fields
        data = {
            # 'user' is missing
            'cart': {},
            # 'shipping_address' is missing
            'status': 'IN_PROGRESS',
            # 'created' and 'modified' are read-only
        }
        serializer = CheckoutSessionSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        # self.assertIn('user', serializer.errors)
        self.assertIn('shipping_address', serializer.errors)

    def test_checkout_session_serializer_representation(self):
        """
        Test the serialized representation of a CheckoutSession.
        This test verifies that the serializer properly serializes a
        CheckoutSession` object, including fields like `user`, `cart`,
        `shipping_address`, and an attached `payment_secret`.

        Steps:
            - Attach a `payment_secret` to the checkout session instance.
            - Serialize the checkout session using the serializer.
            - Verify all expected fields are present in the serialized data.
            - Assert the data types of each field and specific field values.

        Expected Outcome:
            - The serialized data should contain all the expected fields.
            - The data types of the serialized fields should match
            the expectations.
            - The nested cart data should correctly reflect
            the product and quantity.
        """
        # Attach payment_secret to the checkout session
        setattr(self.checkout_session, 'payment_secret', 'serializer_secret')

        # Serialize the checkout session
        serializer = CheckoutSessionSerializer(self.checkout_session)
        data = serializer.data

        # Define expected keys and data types
        expected_keys = {
            'uuid': str,
            'user': int,
            'cart': dict,
            'shipping_address': str,
            'status': str,
            'created': str,
            'modified': str,
            'payment_secret': str
        }

        for key, expected_type in expected_keys.items():
            self.assertIn(key, data)
            self.assertIsInstance(data[key], expected_type)

        # Assert specific field values
        self.assertEqual(data['shipping_address'], '123 Main St')
        self.assertEqual(data['status'], 'IN_PROGRESS')
        self.assertEqual(data['payment_secret'], 'serializer_secret')

        # Assert nested cart data
        self.assertIn('items', data['cart'])
        self.assertEqual(len(data['cart']['items']), 1)
        self.assertEqual(data['cart']['items'][0]['quantity'], 2)
        self.assertEqual(
            data['cart']['items'][0]['product']['name'],
            'Test Product'
        )
