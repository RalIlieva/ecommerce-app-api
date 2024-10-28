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
        self.assertIn('user', serializer.errors)
        self.assertIn('shipping_address', serializer.errors)
