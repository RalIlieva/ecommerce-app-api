from rest_framework.test import APITestCase, APIClient
from checkout.serializers import CheckoutSessionSerializer


class CheckoutSessionSerializerTestCase(APITestCase):

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

    # def test_checkout_session_serializer_representation(self):
    #     # Attach payment_secret to the checkout session
    #     setattr(self.checkout_session, 'payment_secret', 'serializer_secret')
    #
    #     # Serialize the checkout session
    #     serializer = CheckoutSessionSerializer(self.checkout_session)
    #     data = serializer.data
    #
    #     # Define expected keys and data types
    #     expected_keys = {
    #         'uuid': str,
    #         'user': int,
    #         'cart': dict,
    #         'shipping_address': str,
    #         'status': str,
    #         'created': str,
    #         'modified': str,
    #         'payment_secret': str
    #     }
    #
    #     for key, expected_type in expected_keys.items():
    #         self.assertIn(key, data)
    #         self.assertIsInstance(data[key], expected_type)
    #
    #     # Assert specific field values
    #     self.assertEqual(data['shipping_address'], '123 Main St')
    #     self.assertEqual(data['status'], 'IN_PROGRESS')
    #     self.assertEqual(data['payment_secret'], 'serializer_secret')
    #
    #     # Assert nested cart data
    #     self.assertIn('items', data['cart'])
    #     self.assertEqual(len(data['cart']['items']), 1)
    #     self.assertEqual(data['cart']['items'][0]['quantity'], 2)
    #     self.assertEqual(data['cart']['items'][0]['product']['name'], 'Test Product')
