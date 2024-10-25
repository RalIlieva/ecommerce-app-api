from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from products.models import Product, Category
from .models import Cart, CartItem
from django.urls import reverse


class CartTestCase(APITestCase):

    def setUp(self):
        # Create a test user
        self.user = get_user_model().objects.create_user(
            email="testuser@example.com",
            password="password123"
        )
        # Authenticate user
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # Create a product category
        self.category = Category.objects.create(name="Test Category")

        # Create a product to be used in the cart
        self.product = Product.objects.create(
            name="Test Product",
            price=50.00,
            stock=100,
            category=self.category
        )

    def tearDown(self):
        Cart.objects.all().delete()
        get_user_model().objects.all().delete()

    def test_create_cart_item(self):
        url = reverse('cart:add-cart-item')
        data = {'product_id': self.product.id, 'quantity': 2}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CartItem.objects.count(), 1)
        self.assertEqual(CartItem.objects.first().quantity, 2)

    def test_update_cart_item(self):
        # First, create a cart item
        cart = Cart.objects.create(user=self.user)
        cart_item = CartItem.objects.create(cart=cart, product=self.product, quantity=1)

        # Update the cart item quantity
        url = reverse('cart:update-cart-item', kwargs={'uuid': cart_item.uuid})
        data = {'quantity': 5}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        cart_item.refresh_from_db()
        self.assertEqual(cart_item.quantity, 5)

    def test_remove_cart_item(self):
        # First, create a cart item
        cart = Cart.objects.create(user=self.user)
        cart_item = CartItem.objects.create(cart=cart, product=self.product, quantity=1)

        # Remove the cart item
        url = reverse('cart:remove-cart-item', kwargs={'uuid': cart_item.uuid})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CartItem.objects.count(), 0)

    def test_retrieve_cart_details(self):
        # Create a cart and add items
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=3)

        # Retrieve the cart details
        url = reverse('cart:cart-detail')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['quantity'], 3)

    def test_unauthorized_cart_access(self):
        # Log out the user to make them unauthenticated
        self.client.logout()
        url = reverse('cart:cart-detail')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
