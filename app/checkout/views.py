"""
Views for checkout app.
"""
from drf_spectacular.utils import (
    extend_schema_view,
    extend_schema,
    OpenApiParameter,
    OpenApiTypes
)
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

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
from order.models import Order
from django.db import transaction
from core.exceptions import (
    InvalidCheckoutSessionException,
    PaymentFailedException
)


@extend_schema_view(
    post=extend_schema(
        summary="Start a Checkout Session",
        description="Create checkout session for authenticated user's cart. "
                    "Validates that the cart is not empty, creates an order, "
                    "and initiates a payment intent.",
        responses={201: CheckoutSessionSerializer},
        request=CheckoutSessionSerializer,
    )
)
class StartCheckoutSessionView(generics.CreateAPIView):
    """
    API endpoint to start a checkout session.
    This view handles the creation of a checkout session for a user's cart.
    It ensures the cart is not empty, creates an order for the cart items,
    and initiates a payment intent.
    Attributes:
        permission_classes (list):
        List of permission classes;
        only authenticated users can initiate checkout.
        serializer_class (Serializer):
        The serializer used for validating input data.
    Methods:
        post(request, *args, **kwargs):
        Handles POST requests to initiate a checkout session.
       """
    permission_classes = [IsAuthenticated]
    serializer_class = CheckoutSessionSerializer

    def post(self, request, *args, **kwargs):
        """
        Handles the creation of a new checkout session.
        The method retrieves the user's cart, validates that it is not empty,
        and then creates a new checkout session. It also creates an order
        from the cart items and initiates a payment intent.

        Args:
            request (Request):
            The request object containing user and checkout data.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.
        Returns:
            Response:
            JSON response containing the checkout session details
            or error information.
        """
        # Get the user's cart
        cart = get_or_create_cart(request.user)

        # Validate cart - it shouldn't be empty
        if not cart.items.exists():
            return Response(
                {'detail': "Cart is empty."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if a CheckoutSession already exists for this cart
        if CheckoutSession.objects.filter(cart=cart).exists():
            return Response(
                {'detail': "Checkout session already exists for this cart."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate request data using the serializer
        serializer = self.get_serializer(
            data=request.data,
            context={'request': request}
        )
        # Validate input data before proceeding
        serializer.is_valid(raise_exception=True)

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
        order = create_order(user=request.user, items_data=items_data)

        # Create payment intent for checkout & attach it to a payment object
        payment_secret = create_payment_intent(
            order_uuid=order.uuid, user=request.user
        )
        payment = Payment.objects.get(order=order)
        checkout_session.payment = payment
        # Attach 'payment_secret' dynamically to checkout_session instance
        setattr(checkout_session, 'payment_secret', payment_secret)
        checkout_session.save()

        serializer = self.get_serializer(checkout_session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@extend_schema_view(
    post=extend_schema(
        summary="Complete a Checkout Session",
        description="Complete the checkout session by validating the  "
                    "payment status with Stripe and updating order status.",
        parameters=[
            OpenApiParameter(
                'checkout_session_uuid',
                OpenApiTypes.UUID,
                location='path',
                description="UUID of the checkout session to complete."
            )
        ],
        responses={200: OpenApiTypes.OBJECT}
    )
)
class CompleteCheckoutView(APIView):
    """
    API endpoint to complete a checkout session.

    This view handles completing the checkout session by validating the payment
    status with Stripe, updating the status of the payment,
    and marking the order as completed.

    Attributes:
        permission_classes (list): List of permission classes;
        only authenticated users can complete checkout.

    Methods:
        post(request, *args, **kwargs):
        Handles POST requests to complete a checkout session.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        checkout_session_uuid = kwargs['checkout_session_uuid']
        with transaction.atomic():
            checkout_session = get_object_or_404(
                CheckoutSession.objects.select_for_update(),
                uuid=checkout_session_uuid,
                user=request.user
            )

            if checkout_session.status != 'IN_PROGRESS':
                raise InvalidCheckoutSessionException()

            # Retrieve the payment intent from Stripe
            payment_intent = stripe.PaymentIntent.retrieve(
                checkout_session.payment.stripe_payment_intent_id
            )

            # Validate payment intent status
            if payment_intent['status'] != 'succeeded':
                checkout_session.status = 'FAILED'
                checkout_session.payment.status = Payment.FAILED
                checkout_session.save()
                checkout_session.payment.save()

                # Use transaction.on_commit to delay raising the exception
                def raise_exception():
                    raise PaymentFailedException()

                transaction.on_commit(raise_exception)
                return Response(
                    {"detail": "Payment could not be processed"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Proceed with successful payment handling
            update_payment_status(
                checkout_session.payment.stripe_payment_intent_id,
                'COMPLETED'
            )

            checkout_session.status = 'COMPLETED'
            checkout_session.payment.status = Payment.SUCCESS

            order = checkout_session.payment.order
            order.status = Order.PAID

            checkout_session.save()
            checkout_session.payment.save()
            order.save()

        return Response(
            {
                "detail": "Checkout completed successfully.",
                "order_id": checkout_session.payment.order.uuid
            },
            status=status.HTTP_200_OK
        )

        # # Verify if the payment-successful via the frontend-not secure
        # Assume frontend sends payment status
        # payment_status = request.data.get('payment_status')
        # if payment_status != 'SUCCESS':
        #     checkout_session.status = 'FAILED'
        #     checkout_session.save()
        #     return Response(
        #     {"detail": "Payment failed. Checkout could not be completed."},
        #                     status=status.HTTP_400_BAD_REQUEST
        #                     )

        # Update the payment status
