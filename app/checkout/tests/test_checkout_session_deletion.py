from unittest.mock import patch
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from products.models import Product, Category
from payment.models import Payment
from order.models import Order
from cart.models import Cart, CartItem
from checkout.models import CheckoutSession


class CheckoutSessionDeletionTestCase(APITestCase):
    @patch('payment.services.stripe.PaymentIntent.create')
    @patch('payment.services.stripe.PaymentIntent.retrieve')
    def setUp(self, mock_retrieve_payment_intent, mock_create_payment_intent):
        # Mock PaymentIntent.create to return a fake PaymentIntent
        mock_create_payment_intent.return_value = {
            'id': 'pi_test_deletion',
            'client_secret': 'test_client_secret_deletion'
        }

        # Mock PaymentIntent.retrieve to simulate a successful status
        mock_retrieve_payment_intent.return_value = {
            'id': 'pi_test_deletion',
            'status': 'succeeded'
        }

        # Create test user, category, product, cart, cart items,
        # order, payment, and checkout session
        self.user = get_user_model().objects.create_user(
            email="testuser@example.com", password="password123"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.category = Category.objects.create(name="Home Appliances")
        self.product = Product.objects.create(
            name="Refrigerator", price=500.00, stock=3, category=self.category
        )
        self.cart = Cart.objects.create(user=self.user)
        self.cart_item = CartItem.objects.create(
            cart=self.cart, product=self.product, quantity=1
        )
        from order.services import create_order
        from payment.services import create_payment_intent
        self.order = create_order(user=self.user, items_data=[
            {'product': self.product.uuid, 'quantity': 1}
        ])
        # This now uses the mocked function
        self.payment_secret = create_payment_intent(
            order_id=self.order.id, user=self.user
        )
        self.payment = Payment.objects.get(
            order=self.order
        )
        self.checkout_session = CheckoutSession.objects.create(
            user=self.user,
            cart=self.cart,
            shipping_address='789 Maple Ave',
            payment=self.payment,
            status='IN_PROGRESS'
        )

    def test_delete_checkout_session(self):
        # Delete the checkout session
        self.checkout_session.delete()

        # Verify that the checkout session is deleted
        with self.assertRaises(CheckoutSession.DoesNotExist):
            CheckoutSession.objects.get(uuid=self.checkout_session.uuid)

        # Verify that the related Order and Payment still exist
        self.assertTrue(Order.objects.filter(id=self.order.id).exists())
        self.assertTrue(Payment.objects.filter(id=self.payment.id).exists())
