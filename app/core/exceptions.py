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
