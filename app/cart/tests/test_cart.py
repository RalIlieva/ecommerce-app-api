from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from products.models import Product, Category
from cart.models import Cart, CartItem
from django.urls import reverse
from uuid import uuid4


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

        # Create a cart for the user
        self.cart = Cart.objects.create(user=self.user)

    def tearDown(self):
        Cart.objects.all().delete()
        get_user_model().objects.all().delete()

    def test_create_cart_item(self):
        url = reverse('cart:add-cart-item')
        data = {'product_id': self.product.id, 'quantity': 2}
        response = self.client.post(url, data, format='json')
        print(f"Create Cart Item Response Status Code: {response.status_code}")
        print(f"Create Cart Item Response Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CartItem.objects.count(), 1)
        self.assertEqual(CartItem.objects.first().quantity, 2)

    def test_update_cart_item(self):
        # Create a cart item for the existing cart
        cart_item = CartItem.objects.create(cart=self.cart, product=self.product, quantity=1)
        print(f"Cart Item Created with UUID: {cart_item.uuid}")

        # Update the cart item quantity using its UUID
        url = reverse('cart:update-cart-item', kwargs={'uuid': cart_item.uuid})
        data = {'quantity': 5}
        response = self.client.patch(url, data, format='json')
        print(f"Update Cart Item URL: {url}")
        print(f"Update Cart Item Response Status Code: {response.status_code}")
        print(f"Update Cart Item Response Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        cart_item.refresh_from_db()
        self.assertEqual(cart_item.quantity, 5)

    def test_remove_cart_item(self):
        # Create a cart item for the existing cart
        cart_item = CartItem.objects.create(cart=self.cart, product=self.product, quantity=1)
        print(f"Cart Item Created with UUID: {cart_item.uuid}")

        # Remove the cart item using its UUID
        url = reverse('cart:remove-cart-item', kwargs={'uuid': cart_item.uuid})
        response = self.client.delete(url)
        print(f"Remove Cart Item URL: {url}")
        print(f"Remove Cart Item Response Status Code: {response.status_code}")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CartItem.objects.count(), 0)

    def test_retrieve_cart_details(self):
        # Add items to the cart
        CartItem.objects.create(cart=self.cart, product=self.product, quantity=3)

        # Retrieve the cart details
        url = reverse('cart:cart-detail')
        response = self.client.get(url)
        print(f"Retrieve Cart Details Response Status Code: {response.status_code}")
        print(f"Retrieve Cart Details Response Data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['quantity'], 3)

    def test_unauthorized_cart_access(self):
        # Log out the user to make them unauthenticated
        self.client.logout()
        url = reverse('cart:cart-detail')
        response = self.client.get(url)
        print(f"Unauthorized Cart Access Response Status Code: {response.status_code}")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_add_item_with_zero_quantity(self):
        url = reverse('cart:add-cart-item')
        data = {'product_id': self.product.id, 'quantity': 0}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Quantity must be greater than zero.", response.data['detail'])

    def test_add_item_with_negative_quantity(self):
        url = reverse('cart:add-cart-item')
        data = {'product_id': self.product.id, 'quantity': -1}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Quantity must be greater than zero.", response.data['detail'])

    # def test_add_item_exceeding_stock(self):
    #     url = reverse('cart:add-cart-item')
    #     data = {'product_id': self.product.id, 'quantity': 101}  # Stock is 100
    #     response = self.client.post(url, data, format='json')
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertIn("Exceeds available stock.", response.data['detail'])

    def test_add_duplicate_item_updates_quantity(self):
        url = reverse('cart:add-cart-item')
        data = {'product_id': self.product.id, 'quantity': 2}

        # Add item to cart
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CartItem.objects.first().quantity, 2)

        # Add the same item again
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CartItem.objects.first().quantity, 4)  # Quantity should be updated

    def test_clear_cart(self):
        # Add items to the cart
        CartItem.objects.create(cart=self.cart, product=self.product, quantity=2)
        another_product = Product.objects.create(name="Another Product", price=20.00, stock=50, category=self.category)
        CartItem.objects.create(cart=self.cart, product=another_product, quantity=3)

        # Confirm items exist
        self.assertEqual(CartItem.objects.count(), 2)

        # Clear the cart
        url = reverse('cart:clear-cart')
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CartItem.objects.count(), 0)  # Cart should be empty

    def test_remove_non_existent_item(self):
        fake_uuid = uuid4()
        url = reverse('cart:remove-cart-item', kwargs={'uuid': fake_uuid})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Cart item not found.", response.data['detail'])

    def test_access_other_users_cart(self):
        # Create a second user and their cart
        other_user = get_user_model().objects.create_user(email="otheruser@example.com", password="password123")
        other_cart = Cart.objects.create(user=other_user)
        CartItem.objects.create(cart=other_cart, product=self.product, quantity=2)

        # Attempt to access other user's cart item
        cart_item_uuid = CartItem.objects.get(cart=other_cart).uuid
        url = reverse('cart:update-cart-item', kwargs={'uuid': cart_item_uuid})
        response = self.client.patch(url, {'quantity': 5}, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)  # Should not allow access

    # def test_product_removal_updates_cart(self):
    #     # Add an item to the cart
    #     cart_item = CartItem.objects.create(cart=self.cart, product=self.product, quantity=2)
    #     self.assertEqual(CartItem.objects.count(), 1)
    #
    #     # Delete the product
    #     self.product.delete()
    #
    #     # Confirm the cart item was removed
    #     self.assertEqual(CartItem.objects.count(), 0)

    # def test_set_excessive_quantity(self):
    #     # Create a cart item with quantity within stock
    #     cart_item = CartItem.objects.create(cart=self.cart, product=self.product, quantity=1)
    #
    #     # Attempt to set quantity too high
    #     url = reverse('cart:update-cart-item', kwargs={'uuid': cart_item.uuid})
    #     data = {'quantity': 1000}  # Exceeds typical stock limit
    #     response = self.client.patch(url, data, format='json')
    #
    #     self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    #     self.assertIn("Quantity exceeds allowable limit.", response.data['detail'])

    def test_unauthorized_access_to_cart(self):
        # Log out the user to make them unauthenticated
        self.client.logout()

        # Attempt to access the cart detail view
        url = reverse('cart:cart-detail')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_view_empty_cart(self):
        url = reverse('cart:cart-detail')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['items'], [])  # Cart items should be an empty list
