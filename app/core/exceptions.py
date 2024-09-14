"""
Custom exceptions to handle errors.
"""

from rest_framework.exceptions import APIException
from rest_framework import status


class DuplicateSlugException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'An object with this slug already exists.'
    default_code = 'duplicate_slug'
