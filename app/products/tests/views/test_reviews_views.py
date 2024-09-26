# """
# Test API views for reviews.
# """
#
#
# from django.urls import reverse
# from django.contrib.auth import get_user_model
# from rest_framework.test import APITestCase
# from rest_framework import status
# from products.models import Product, Category, Review
#
#
# class ReviewViewTestCase(APITestCase):
#     def setUp(self):
#         self.user = get_user_model().objects.create_user(email='user@example.com', password='password')
#         self.category = Category.objects.create(
#             name="Electronics",
#             slug="electronics"
#         )
#         self.product = Product.objects.create(
#             name='Test Product',
#             price=10.0,
#             slug="test-product",
#             category=self.category,
#             description="Test description",
#             stock=5
#         )
#         self.review = Review.objects.create(
#             user=self.user,
#             product=self.product,
#             rating=5,
#             comment='Great product!'
#         )
#
#     def test_list_reviews(self):
#         url = reverse('products:review-list', kwargs={'product_uuid': self.product.uuid})
#         response = self.client.get(url)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(len(response.data), 1)
#
#     def test_create_review_authenticated(self):
#         url = reverse('products:review-create', kwargs={'product_uuid': self.product.uuid})
#         self.client.force_authenticate(user=self.user)
#         data = {
#             'rating': 4,
#             'comment': 'Another review.'
#         }
#         response = self.client.post(url, data)
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)  # Duplicate review
#
#     def test_create_review_unauthenticated(self):
#         url = reverse('products:review-create', kwargs={'product_uuid': self.product.uuid})
#         data = {
#             'rating': 4,
#             'comment': 'Unauthenticated review.'
#         }
#         response = self.client.post(url, data)
#         self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
#
#     def test_retrieve_review(self):
#         url = reverse('products:product-review-detail', kwargs={'uuid': self.review.uuid})
#         response = self.client.get(url)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertEqual(response.data['uuid'], str(self.review.uuid))
#
#     def test_update_review_owner(self):
#         url = reverse('products:product-review-detail', kwargs={'uuid': self.review.uuid})
#         self.client.force_authenticate(user=self.user)
#         data = {
#             'rating': 3,
#             'comment': 'Updated review.'
#         }
#         response = self.client.put(url, data)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.review.refresh_from_db()
#         self.assertEqual(self.review.rating, 3)
#         self.assertEqual(self.review.comment, 'Updated review.')
#
#     def test_update_review_non_owner(self):
#         url = reverse('products:product-review-detail', kwargs={'uuid': self.review.uuid})
#         other_user = get_user_model().objects.create_user(email='other@example.com', password='password')
#         self.client.force_authenticate(user=other_user)
#         data = {
#             'rating': 2,
#             'comment': 'Attempted update.'
#         }
#         response = self.client.put(url, data)
#         self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
#
#     def test_delete_review_owner(self):
#         url = reverse('products:product-review-detail', kwargs={'uuid': self.review.uuid})
#         self.client.force_authenticate(user=self.user)
#         response = self.client.delete(url)
#         self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
#         self.assertFalse(Review.objects.filter(uuid=self.review.uuid).exists())
#
#     def test_delete_review_non_owner(self):
#         url = reverse('products:product-review-detail', kwargs={'uuid': self.review.uuid})
#         other_user = get_user_model().objects.create_user(email='other@example.com', password='password')
#         self.client.force_authenticate(user=other_user)
#         response = self.client.delete(url)
#         self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
