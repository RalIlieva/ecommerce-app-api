"""
Custom exceptions to handle errors.
"""

from rest_framework.exceptions import APIException
from rest_framework import status


class DuplicateSlugException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'An object with this slug already exists.'
    default_code = 'duplicate_slug'


class InsufficientStockError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Not enough stock available"
    default_code = 'insufficient_stock'


class PaymentFailedException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Payment could not be processed"
    default_code = 'payment_failed'


class OrderAlreadyPaidException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "This order is already paid"
    default_code = 'order_already_paid'


class ProductAlreadyInWishlistException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "The product is already in your wishlist."
    default_code = 'product_already_in_wishlist'


class ProductNotInWishlistException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "The product is not in your wishlist."
    default_code = 'product_not_in_wishlist'
