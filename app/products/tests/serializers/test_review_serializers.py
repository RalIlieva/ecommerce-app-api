from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from rest_framework.test import APIClient, APIRequestFactory
from products.models import Product, Review, Category
from products.serializers import ReviewSerializer


class ReviewSerializerTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(email='user@example.com', password='password')
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

        # self.client.force_authenticate(self.user)

    def test_review_creation(self):
        data = {
            'rating': 5,
            'comment': 'Great product!',
        }

        # Simulate a request using APIRequestFactory
        factory = APIRequestFactory()
        request = factory.post('/reviews/', data, format='json')

        request.user = self.user

        context = {
            'request': request,
            'product': self.product,
        }
        serializer = ReviewSerializer(data=data, context=context)
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.comment, 'Great product!')
        self.assertEqual(review.user, self.user)
        self.assertEqual(review.product, self.product)
