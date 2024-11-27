from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework.views import APIView
from rest_framework import status
from core.exceptions import InsufficientStockException


# Temporary view to simulate an insufficient stock scenario
class MockStockView(APIView):
    def get(self, request):
        raise InsufficientStockException("Not enough stock available")


# Test case for InsufficientStockError handling
class InsufficientStockErrorTestCase(TestCase):
    def setUp(self):
        # Create a test user
        self.user = get_user_model().objects.create_user(
            email='testuser@example.com',
            password='password123'
        )
        self.factory = APIRequestFactory()

    def test_insufficient_stock_error(self):
        request = self.factory.get('/mock-stock-view/')
        force_authenticate(request, user=self.user)
        view = MockStockView.as_view()
        response = view(request)

        # Check that response status is 400 and the detail message is correct
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'], "Not enough stock available")
