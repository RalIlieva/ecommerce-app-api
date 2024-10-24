import stripe
from django.conf import settings
from rest_framework.exceptions import ValidationError
from order.models import Order
from .models import Payment

stripe.api_key = settings.STRIPE_SECRET_KEY


def create_payment_intent(order_id, user):
    try:
        order = Order.objects.get(id=order_id, user=user)
    except Order.DoesNotExist:
        raise ValidationError("Order does not exist.")

    if order.status != Order.PENDING:
        raise ValidationError("Order is not in a payable state.")

    if Payment.objects.filter(order=order).exists():
        raise ValidationError(
            {'error': 'Payment already exists for this order'}
        )

    # Use the order total_amount for the payment
    total_amount = order.total_amount
    if total_amount <= 0:
        raise ValidationError(
            {'error': 'Total amount must be greater than zero'}
        )

    # Create a Stripe payment intent
    intent = stripe.PaymentIntent.create(
        amount=int(total_amount * 100),  # Stripe uses cents
        currency='usd',
        metadata={'order_id': order.id},
        payment_method_types=['card'],
    )

    # Create a payment object in the database
    payment = Payment.objects.create(
        order=order,
        user=user,
        amount=order.total_amount,
        status=Payment.PENDING,
        stripe_payment_intent_id=intent['id'],
    )

    return intent['client_secret']


def update_payment_status(payment_intent_id, status):
    try:
        payment = Payment.objects.get(
            stripe_payment_intent_id=payment_intent_id
        )
    except Payment.DoesNotExist:
        raise ValidationError(
            "Payment with the given Payment Intent ID does not exist."
        )

    payment.status = status
    payment.save()
    return payment
