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

from rest_framework import status
import stripe.error as stripe_error

from .exceptions import (
    DuplicateSlugException,
    InsufficientStockException,
    PaymentFailedException,
    OrderAlreadyPaidException,
    ProductAlreadyInWishlistException,
    ProductNotInWishlistException,
    InvalidCheckoutSessionException,
)


logger = logging.getLogger(__name__)


EXCEPTION_HANDLERS = {
    InsufficientStockException: lambda exc: Response({"detail": exc.detail}, status=exc.status_code),
    DuplicateSlugException: lambda exc: Response({"detail": exc.detail}, status=exc.status_code),
    PaymentFailedException: lambda exc: Response({"detail": exc.detail}, status=exc.status_code),
    OrderAlreadyPaidException: lambda exc: Response({"detail": exc.detail}, status=exc.status_code),
    ProductAlreadyInWishlistException: lambda exc: Response({"detail": exc.detail}, status=exc.status_code),
    ProductNotInWishlistException: lambda exc: Response({"detail": exc.detail}, status=exc.status_code),
    InvalidCheckoutSessionException: lambda exc: Response({"detail": exc.detail}, status=exc.status_code),
}


def drf_default_with_modifications_exception_handler(exc, context):
    """
    Custom exception handler that ensures all error responses have a 'detail' key.
    """
    if isinstance(exc, (DjangoValidationError, Http404, PermissionDenied)):
        exc = exceptions.ValidationError(as_serializer_error(exc)) if isinstance(exc, DjangoValidationError) else exc
        exc = exceptions.NotFound() if isinstance(exc, Http404) else exc
        exc = exceptions.PermissionDenied() if isinstance(exc, PermissionDenied) else exc

    # Call DRF's default exception handler first
    response = exception_handler(exc, context)

    # Handle custom exceptions using a map
    handler = EXCEPTION_HANDLERS.get(type(exc))
    if handler:
        logger.warning(f"{type(exc).__name__}: {exc.detail}")
        return handler(exc)

    # Handle Stripe errors
    if isinstance(exc, stripe_error.StripeError):
        logger.error(f"Stripe error: {exc}", exc_info=True)
        return Response(
            {"detail": "An error occurred with the payment service."},
            status=status.HTTP_502_BAD_GATEWAY
        )

    # If no handler found, return the default response
    if response is None:
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return Response({"detail": "An unexpected error occurred."}, status=500)

    # Ensure 'detail' key is present in the response data
    if 'detail' not in response.data:
        response.data = {"detail": response.data}

    return response

# def drf_default_with_modifications_exception_handler(exc, context):
#     """
#     Custom exception handler that ensures -
#     all error responses have a 'detail' key.
#     Handles the custom exceptions -  DuplicateSlugException,
#     InsufficientStockError,
#     PaymentFailedException,
#     OrderAlreadyPaidException,
#     ProductAlreadyInWishlistException,
#     ProductNotInWishlistException,
#     and Django's ValidationError.
#     """
#
#     # Convert Django exceptions to DRF exceptions
#     if isinstance(exc, DjangoValidationError):
#         exc = exceptions.ValidationError(as_serializer_error(exc))
#
#     if isinstance(exc, Http404):
#         exc = exceptions.NotFound()
#
#     if isinstance(exc, PermissionDenied):
#         exc = exceptions.PermissionDenied()
#
#     # Call DRF's default exception handler first
#     response = exception_handler(exc, context)
#
#     if isinstance(exc, InsufficientStockException):
#         logger.warning(f"Insufficient stock error: {exc.detail}")
#         response = Response(
#             {"detail": exc.detail},
#             status=exc.status_code
#         )
#         return response
#
#     # If exception is DuplicateSlugException, customize the response
#     if isinstance(exc, DuplicateSlugException):
#         logger.warning(f"Duplicate slug error: {exc.detail}")
#         response = Response(
#             {"detail": exc.detail},
#             status=exc.status_code
#         )
#         return response
#
#     if isinstance(exc, PaymentFailedException):
#         logger.warning(f"Payment failure error: {exc.detail}")
#         response = Response(
#             {"detail": exc.detail},
#             status=exc.status_code
#         )
#         return response
#
#     if isinstance(exc, InvalidCheckoutSessionException):
#         logger.warning(f"Invalid checkout session: {exc.detail}")
#         response = Response({"detail": exc.detail}, status=exc.status_code)
#         return response
#
#     if isinstance(exc, OrderAlreadyPaidException):
#         logger.warning(f"Order already paid error: {exc.detail}")
#         response = Response(
#             {"detail": exc.detail},
#             status=exc.status_code
#         )
#         return response
#
#     if isinstance(exc, ProductAlreadyInWishlistException):
#         logger.warning(f"Product in wishlist error: {exc.detail}")
#         response = Response(
#             {"detail": exc.detail},
#             status=exc.status_code
#         )
#         return response
#
#     if isinstance(exc, ProductNotInWishlistException):
#         logger.warning(f"Product wishlist error: {exc.detail}")
#         response = Response(
#             {"detail": exc.detail},
#             status=exc.status_code
#         )
#         return response
#
#     elif isinstance(exc, stripe_error.StripeError):
#         logger.error(f"Stripe error: {exc}", exc_info=True)
#         return Response(
#             {"detail": "An error occurred with the payment service."},
#             status=status.HTTP_502_BAD_GATEWAY
#         )
#
#     # If response is None, it's an unhandled exception
#     if response is None:
#         logger.error(f"Unhandled exception: {exc}", exc_info=True)
#         return Response(
#             {"detail": "An unexpected error occurred."},
#             status=500
#         )
#
#     # Ensure the response data has a 'detail' key
#     if not isinstance(response.data, dict) or 'detail' not in response.data:
#         response.data = {"detail": response.data}
#
#         # Log different levels based on exception type
#     if isinstance(exc, exceptions.ValidationError):
#         logger.warning(f"Validation error: {response.data['detail']}")
#     elif isinstance(exc, exceptions.PermissionDenied):
#         logger.warning(f"Permission denied: {response.data['detail']}")
#     elif isinstance(exc, exceptions.NotFound):
#         logger.warning(f"Not found: {response.data['detail']}")
#     else:
#         logger.error(f"Unhandled exception type: {exc}", exc_info=True)
#
#     return response
