from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from stripe import error as stripe_error
import stripe

from .models import CheckoutSession
from cart.services import get_or_create_cart
from .serializers import CheckoutSessionSerializer
from order.services import create_order
from payment.services import (
    create_payment_intent,
    update_payment_status
)
from payment.models import Payment
from order.models import Order, OrderItem
from django.db import transaction


class StartCheckoutSessionView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CheckoutSessionSerializer

    def post(self, request, *args, **kwargs):
        # Get the user's cart
        cart = get_or_create_cart(request.user)

        # Validate cart - it shouldn't be empty
        if not cart.items.exists():
            return Response({'detail': "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if a CheckoutSession already exists for this cart
        if CheckoutSession.objects.filter(cart=cart).exists():
            return Response(
                {'detail': "Checkout session already exists for this cart."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate request data using the serializer
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)  # Validate input data before proceeding

        # Extract validated data
        shipping_address = serializer.validated_data['shipping_address']

        # Create the checkout session
        checkout_session = CheckoutSession.objects.create(
            user=request.user,
            cart=cart,
            shipping_address=shipping_address
        )

        # Prepare items data to pass to create_order function
        items_data = [
            {
                'product': item.product.uuid,
                'quantity': item.quantity
            }
            for item in cart.items.all()
        ]

        # Create an order from the cart
        try:
            order = create_order(user=request.user, items_data=items_data)
        except Exception as e:
            return Response({'detail': f"Failed to create order: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Create a payment intent for the checkout and attach it to a payment object
        try:
            payment_secret = create_payment_intent(order_id=order.id, user=request.user)
            payment = Payment.objects.get(order=order)
            checkout_session.payment = payment
            # Attach 'payment_secret' dynamically to the checkout_session instance
            setattr(checkout_session, 'payment_secret', payment_secret)
            checkout_session.save()
        except Exception as e:
            return Response({'detail': f"Failed to create payment intent: {str(e)}"},
                            status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(checkout_session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CompleteCheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        checkout_session_uuid = kwargs['checkout_session_uuid']
        try:
            checkout_session = CheckoutSession.objects.select_for_update().get(uuid=checkout_session_uuid,
                                                                               user=request.user)
        except CheckoutSession.DoesNotExist:
            return Response({"detail": "Checkout session not found."}, status=status.HTTP_404_NOT_FOUND)

        if checkout_session.status != 'IN_PROGRESS':
            return Response({"detail": "Checkout session is no longer valid."}, status=status.HTTP_400_BAD_REQUEST)

            # Retrieve the payment intent from Stripe
        try:
            payment_intent = stripe.PaymentIntent.retrieve(checkout_session.payment.stripe_payment_intent_id)
            # Validate payment intent status
            # if payment_intent.status != 'succeeded':
            if payment_intent['status'] != 'succeeded':
                checkout_session.status = 'FAILED'
                checkout_session.payment.status = Payment.FAILED
                checkout_session.save()
                checkout_session.payment.save()

                return Response({"detail": "Payment failed. Checkout could not be completed."},
                                    status=status.HTTP_400_BAD_REQUEST)
        except stripe_error.InvalidRequestError as e:
            return Response({"detail": f"Stripe payment retrieval failed: {str(e)}"},
                            status=status.HTTP_400_BAD_REQUEST)

        # # Here, we verify if the payment was successful via the frontend - not secure
        # payment_status = request.data.get('payment_status')  # Assume frontend sends payment status
        # if payment_status != 'SUCCESS':
        #     checkout_session.status = 'FAILED'
        #     checkout_session.save()
        #     return Response({"detail": "Payment failed. Checkout could not be completed."},
        #                     status=status.HTTP_400_BAD_REQUEST)

        # Update the payment status
        try:
            update_payment_status(checkout_session.payment.stripe_payment_intent_id, 'COMPLETED')
        except Exception as e:
            print(f"Failed to update payment status: {str(e)}")  # Debug statement
            return Response({"detail": f"Failed to update payment status: {str(e)}"},
                            status=status.HTTP_400_BAD_REQUEST)

        # Update the checkout session and order status
        checkout_session.status = 'COMPLETED'
        checkout_session.payment.status = Payment.SUCCESS

        order = checkout_session.payment.order
        order.status = Order.PAID

        checkout_session.save()
        checkout_session.payment.save()
        order.save()

        return Response({"detail": "Checkout completed successfully.", "order_id": checkout_session.payment.order.uuid},
                        status=status.HTTP_200_OK)
