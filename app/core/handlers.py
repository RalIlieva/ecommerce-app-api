# core/handlers.py

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from .exceptions import DuplicateSlugException


def custom_exception_handler(exc, context):
    # Call DRF's default exception handler first
    response = exception_handler(exc, context)

    # If exception is DuplicateSlugException, customize the response
    if isinstance(exc, DuplicateSlugException):
        response = Response(
            {"detail": exc.detail},
            status=exc.status_code
        )

    return response
