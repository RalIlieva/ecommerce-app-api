# core/handlers.py

import logging

from django.core.exceptions import (
    ValidationError as DjangoValidationError,
    PermissionDenied
)
from django.http import Http404

from rest_framework.views import exception_handler
from rest_framework import exceptions
from rest_framework.response import Response
from rest_framework.serializers import as_serializer_error

# from rest_framework import status

from .exceptions import (
    DuplicateSlugException,
    InsufficientStockError,
    PaymentFailedException,
    OrderAlreadyPaidException,
)


logger = logging.getLogger(__name__)


def drf_default_with_modifications_exception_handler(exc, context):
    """
    Custom exception handler that ensures -
    all error responses have a 'detail' key.
    Handles DuplicateSlugException and Django's ValidationError.
    """

    # Convert Django exceptions to DRF exceptions
    if isinstance(exc, DjangoValidationError):
        exc = exceptions.ValidationError(as_serializer_error(exc))

    if isinstance(exc, Http404):
        exc = exceptions.NotFound()

    if isinstance(exc, PermissionDenied):
        exc = exceptions.PermissionDenied()

    # Call DRF's default exception handler first
    response = exception_handler(exc, context)

    if isinstance(exc, InsufficientStockError):
        logger.warning(f"Insufficient stock error: {exc.detail}")
        response = Response(
            {"detail": exc.detail},
            status=exc.status_code
        )
        return response

    # If exception is DuplicateSlugException, customize the response
    if isinstance(exc, DuplicateSlugException):
        logger.warning(f"Duplicate slug error: {exc.detail}")
        response = Response(
            {"detail": exc.detail},
            status=exc.status_code
        )
        return response

    if isinstance(exc, PaymentFailedException):
        logger.warning(f"Duplicate slug error: {exc.detail}")
        response = Response(
            {"detail": exc.detail},
            status=exc.status_code
        )
        return response

    if isinstance(exc, OrderAlreadyPaidException):
        logger.warning(f"Duplicate slug error: {exc.detail}")
        response = Response(
            {"detail": exc.detail},
            status=exc.status_code
        )
        return response

    # If response is None, it's an unhandled exception
    if response is None:
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return Response(
            {"detail": "An unexpected error occurred."},
            status=500
        )

    # Ensure the response data has a 'detail' key
    if not isinstance(response.data, dict) or 'detail' not in response.data:
        response.data = {"detail": response.data}

        # Log different levels based on exception type
    if isinstance(exc, exceptions.ValidationError):
        logger.warning(f"Validation error: {response.data['detail']}")
    elif isinstance(exc, exceptions.PermissionDenied):
        logger.warning(f"Permission denied: {response.data['detail']}")
    elif isinstance(exc, exceptions.NotFound):
        logger.warning(f"Not found: {response.data['detail']}")
    else:
        logger.error(f"Unhandled exception type: {exc}", exc_info=True)

    return response


# def log_exception(exc):
#     """Logs exceptions based on severity and type."""
#     if isinstance(exc, exceptions.ValidationError):
#         logger.warning(f"Validation error: {exc.detail}")
#     elif isinstance(exc, exceptions.PermissionDenied):
#         logger.warning(f"Permission denied: {exc.detail}")
#     elif isinstance(exc, exceptions.NotFound):
#         logger.warning(f"Not found: {exc.detail}")
#     else:
#         logger.error(f"Unhandled exception type: {exc}", exc_info=True)
#
# def format_exception_response(exc):
#     """Formats the exception into a DRF response."""
#     return Response({"detail": exc.detail}, status=exc.status_code)
#
# def drf_default_with_modifications_exception_handler(exc, context):
#     """
#     Custom exception handler - all error responses have a 'detail' key.
#     Handles specific custom exceptions and Django's ValidationError.
#     """
#
#     # Convert Django exceptions to DRF exceptions
#     if isinstance(exc, DjangoValidationError):
#         exc = exceptions.ValidationError(as_serializer_error(exc))
#     elif isinstance(exc, Http404):
#         exc = exceptions.NotFound()
#     elif isinstance(exc, PermissionDenied):
#         exc = exceptions.PermissionDenied()
#
#     # Call DRF's default exception handler first
#     response = exception_handler(exc, context)
#
#     # Handle custom exceptions specifically
#     if isinstance(exc, (
#     DuplicateSlugException,
#     InsufficientStockError,
#     PaymentFailedException,
#     OrderAlreadyPaidException)
#     ):
#         logger.warning(f"Custom exception occurred: {exc.detail}")
#         response = format_exception_response(exc)
#         return response
#
#     # Handle unhandled exceptions
#     if response is None:
#         logger.error(f"Unhandled exception: {exc}", exc_info=True)
#         return Response(
#             {"detail": "An unexpected error occurred."},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )
#
#     # Ensure the response data has a 'detail' key
#     if not isinstance(response.data, dict) or 'detail' not in response.data:
#         response.data = {"detail": response.data}
#
#     # Log the exception details
#     log_exception(exc)
#
#     return response
