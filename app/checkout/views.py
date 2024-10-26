from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CheckoutSession
from cart.services import get_or_create_cart
from .serializers import CheckoutSessionSerializer
from order.services import create_order_from_cart
from payment.services import (
    create_payment_intent,
    update_payment_status
)
from django.db import transaction


class StartCheckoutSessionView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CheckoutSessionSerializer

    def post(self, request, *args, **kwargs):
        # Get the user's cart
        cart = get_or_create_cart(request.user)

        # Create the checkout session
        checkout_session = CheckoutSession.objects.create(
            user=request.user,
            cart=cart,
            shipping_address=request.data.get('shipping_address', '')
        )

        # Create a payment intent for the checkout
        try:
            # Order is not created yet, we use cart's total
            payment_secret = create_payment_intent(order_id=None, user=request.user,
                                                   total_amount=cart.get_total())
            checkout_session.payment_secret = payment_secret
        except Exception as e:
            return Response({'detail': f"Failed to create payment intent: {str(e)}"},
                            status=status.HTTP_400_BAD_REQUEST)

        checkout_session.save()

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

        # Here, we verify if the payment was successful
        payment_status = request.data.get('payment_status')  # Assume frontend sends payment status
        if payment_status != 'SUCCESS':
            checkout_session.status = 'FAILED'
            checkout_session.save()
            return Response({"detail": "Payment failed. Checkout could not be completed."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Create an order from the cart after successful payment
        order = create_order_from_cart(checkout_session.cart, request.user)
        if order:
            checkout_session.status = 'COMPLETED'
            checkout_session.save()

            # Update payment status
            try:
                update_payment_status(checkout_session.payment.stripe_payment_intent_id, 'COMPLETED')
            except Exception as e:
                return Response({"detail": f"Failed to update payment status: {str(e)}"},
                                status=status.HTTP_400_BAD_REQUEST)

            return Response({"detail": "Checkout completed successfully.", "order_id": order.uuid},
                            status=status.HTTP_200_OK)

        return Response({"detail": "Failed to complete checkout."}, status=status.HTTP_400_BAD_REQUEST)
