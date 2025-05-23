"""
Test API views for reviews.
"""


from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from products.models import Product, Category, Review
from users.models import CustomerProfile


class ReviewViewTestCase(APITestCase):
    def setUp(self):

        self.user = get_user_model().objects.create_user(
            email='user@example.com',
            password='password',
            name='User'
        )
        self.customer_profile = CustomerProfile.objects.get(user=self.user)
        self.category = Category.objects.create(
            name="Electronics",
            slug="electronics"
        )
        self.product = Product.objects.create(
            name='Test Product',
            price=10.0,
            slug="test-product",
            category=self.category,
            description="Test description",
            stock=5
        )
        self.review = Review.objects.create(
            user=self.user,
            product=self.product,
            rating=5,
            comment='Great product!'
        )

    def test_list_reviews(self):
        url = reverse('products:review-list', kwargs={
            'product_uuid': self.product.uuid,
            'slug': self.product.slug
        })
        response = self.client.get(url)
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(
            response.data['results'][0]['uuid'],
            str(self.review.uuid)
        )
        self.assertEqual(response.data['results'][0]['comment'],
                         'Great product!')
        self.assertEqual(response.data['results'][0]['rating'],
                         5)
        self.assertEqual(response.data['results'][0]['user']['name'],
                         self.user.name)

    def test_list_reviews_without_user_name(self):
        """Test listing reviews where username is not set."""
        # Create a user without a name
        user_without_name = get_user_model().objects.create_user(
            email='noname@example.com',
            password='userpass',
            name=''  # Empty name
        )

        # Create a review for this user
        review_without_name = Review.objects.create(
            user=user_without_name,
            product=self.product,
            rating=4,
            comment='Good product!'
        )

        # List reviews
        url = reverse('products:review-list', kwargs={
            'product_uuid': self.product.uuid,
            'slug': self.product.slug
        })
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

        # Sort reviews by 'created' field to match the ordering in the queryset
        sorted_reviews = sorted(
            response.data['results'],
            key=lambda x: x['created'],
            reverse=True
        )

        # Verify review content for the user without a name
        review_data = sorted_reviews[0]
        # review_data = response.data['results'][1]
        self.assertEqual(review_data['uuid'], str(review_without_name.uuid))
        self.assertEqual(review_data['comment'], review_without_name.comment)
        self.assertIn('uuid', review_data['user'])
        self.assertIn('name', review_data['user'])
        # Derived name from email
        self.assertEqual(review_data['user']['name'], 'noname')

    def test_create_review_authenticated(self):
        url = reverse('products:review-create', kwargs={
            'product_uuid': self.product.uuid,
            'slug': self.product.slug
        })
        self.client.force_authenticate(user=self.user)
        data = {
            'rating': 4,
            'comment': 'Another review.'
        }
        response = self.client.post(url, data)
        # Duplicate review
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_review_unauthenticated(self):
        url = reverse('products:review-create', kwargs={
            'product_uuid': self.product.uuid,
            'slug': self.product.slug
        })
        data = {
            'rating': 4,
            'comment': 'Unauthenticated review.'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_review(self):
        url = reverse('products:product-review-detail', kwargs={
            'product_uuid': self.product.uuid,
            'slug': self.product.slug,
            'uuid': self.review.uuid
        })
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['uuid'], str(self.review.uuid))

    def test_update_review_owner(self):
        url = reverse('products:product-review-detail', kwargs={
            'product_uuid': self.product.uuid,
            'slug': self.product.slug,
            'uuid': self.review.uuid
        })
        self.client.force_authenticate(user=self.user)
        data = {
            'rating': 3,
            'comment': 'Updated review.'
        }
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.review.refresh_from_db()
        self.assertEqual(self.review.rating, 3)
        self.assertEqual(self.review.comment, 'Updated review.')

    def test_update_review_non_owner(self):
        url = reverse('products:product-review-detail', kwargs={
            'product_uuid': self.product.uuid,
            'slug': self.product.slug,
            'uuid': self.review.uuid
        })
        other_user = get_user_model().objects.create_user(
            email='other@example.com',
            password='password'
        )
        self.client.force_authenticate(user=other_user)
        data = {
            'rating': 2,
            'comment': 'Attempted update.'
        }
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_review_owner(self):
        url = reverse('products:product-review-detail', kwargs={
            'product_uuid': self.product.uuid,
            'slug': self.product.slug,
            'uuid': self.review.uuid
        })
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Review.objects.filter(uuid=self.review.uuid).exists())

    def test_delete_review_non_owner(self):
        url = reverse('products:product-review-detail', kwargs={
            'product_uuid': self.product.uuid,
            'slug': self.product.slug,
            'uuid': self.review.uuid
        })
        other_user = get_user_model().objects.create_user(
            email='other@example.com',
            password='password'
        )
        self.client.force_authenticate(user=other_user)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
