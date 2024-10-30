from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from products.models import Product, Category
from cart.models import Cart, CartItem
from checkout.models import CheckoutSession
from checkout.serializers import CheckoutSessionSerializer


class CheckoutSessionSerializerTestCase(APITestCase):

    def setUp(self):
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

        # Create a checkout session
        self.checkout_session = CheckoutSession.objects.create(
            user=self.user,
            cart=self.cart,
            shipping_address="123 Main St",
            status='IN_PROGRESS'
        )

    def test_serializer_validation_missing_fields(self):
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
