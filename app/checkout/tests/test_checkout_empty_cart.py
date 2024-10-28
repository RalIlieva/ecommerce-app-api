# from rest_framework import status
# from rest_framework.test import APITestCase, APIClient
# from django.urls import reverse
# from django.contrib.auth import get_user_model
# from cart.models import Cart
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
#     def test_checkout_with_empty_cart(self):
#         # Ensure the cart is empty
#         cart = Cart.objects.get(user=self.user)
#         cart.items.all().delete()  # Remove all items from the cart
#
#         # Endpoint for initiating the checkout process
#         url = reverse('checkout:start-checkout')
#
#         # Make a POST request to start checkout
#         response = self.client.post(url, format='json', data={'shipping_address': '123 Main St'})
#
#         # Assert that the response status is 400 BAD REQUEST
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
#
#         # Assert that the error message is as expected
#         self.assertEqual(response.data['detail'], "Cart is empty.")
