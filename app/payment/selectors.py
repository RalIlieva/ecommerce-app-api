"""
Business logic - fetching from db.
"""

from .models import Payment


def get_user_payments(user):
    """
    Retrieve all payments for a specific user.
    """
    return Payment.objects.filter(user=user).order_by('-created')


def get_payment_by_uuid(user, uuid):
    """
    Retrieve a specific payment by UUID for a user.
    """
    try:
        return Payment.objects.get(user=user, uuid=uuid)
    except Payment.DoesNotExist:
        return None
