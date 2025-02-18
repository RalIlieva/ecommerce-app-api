from unittest.mock import patch
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from products.models import Product, Category
from payment.models import Payment
from order.models import Order
from cart.models import Cart, CartItem
from checkout.models import CheckoutSession, ShippingAddress


class CheckoutSessionDeletionTestCase(APITestCase):
    """
    Test case for the deletion of a CheckoutSession.
    Ensures that deleting a CheckoutSession does not affect
    related objects such as the Order or Payment.
    """
    @patch('payment.services.stripe.PaymentIntent.create')
    @patch('payment.services.stripe.PaymentIntent.retrieve')
    def setUp(
            self, mock_retrieve_payment_intent,
            mock_create_payment_intent
    ):
        """
        Set up the environment for the test.

        Mocks the Stripe PaymentIntent creation and retrieval calls to prevent
        real API interactions. Sets up a test user, category, product, cart,
        cart items, order, payment, and checkout session.

        Args:
            mock_retrieve_payment_intent (MagicMock):
            Mock for retrieving PaymentIntent.
            mock_create_payment_intent (MagicMock):
            Mock for creating PaymentIntent.

        Steps:
            - Mock Stripe API calls to simulate successful payment scenarios.
            - Create and authenticate a test user.
            - Create the related objects needed for a checkout session:
            product, cart, order, payment, etc.
        """
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
            order_uuid=self.order.uuid, user=self.user
        )
        self.payment = Payment.objects.get(
            order=self.order
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
        self.checkout_session = CheckoutSession.objects.create(
            user=self.user,
            cart=self.cart,
            shipping_address=self.shipping_address,
            payment=self.payment,
            status='IN_PROGRESS'
        )

    def test_delete_checkout_session(self):
        """
        Test the deletion of a CheckoutSession.

        This test verifies that deleting a CheckoutSession
        does not delete the related Order or Payment objects.
        Only the CheckoutSession is expected to be removed,
        while other related data remains intact.

        Steps:
            - Delete the existing checkout session.
            - Verify that the checkout session is deleted.
            - Ensure that related Order and Payment objects still exist.

        Expected Outcomes:
            - Deleting the checkout session should raise
             DoesNotExist exception when attempting to
             retrieve it from db.
            - The Order and Payment should still be present in the database.
        """
        # Delete the checkout session
        self.checkout_session.delete()

        # Verify that the checkout session is deleted
        with self.assertRaises(CheckoutSession.DoesNotExist):
            CheckoutSession.objects.get(uuid=self.checkout_session.uuid)

        # Verify that the related Order and Payment still exist
        self.assertTrue(Order.objects.filter(id=self.order.id).exists())
        self.assertTrue(Payment.objects.filter(id=self.payment.id).exists())
