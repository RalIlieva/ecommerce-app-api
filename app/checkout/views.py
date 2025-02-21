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

from .models import CheckoutSession, ShippingAddress
from cart.services import get_or_create_cart
from .serializers import CheckoutSessionSerializer, ShippingAddressSerializer
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
    permission_classes = [IsAuthenticated]
    serializer_class = CheckoutSessionSerializer

    def post(self, request, *args, **kwargs):
        print("Request Data:", request.data)  # Debugging line

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
        serializer.is_valid(raise_exception=True)

        shipping_address_data = serializer.validated_data.get('shipping_address')
        new_shipping_address_data = serializer.validated_data.get('new_shipping_address')

        # Create or assign shipping address
        if new_shipping_address_data:
            shipping_address = ShippingAddress.objects.create(
                user=request.user,
                **new_shipping_address_data
            )
        elif shipping_address_data:
            shipping_address, _ = ShippingAddress.objects.get_or_create(
                user=request.user,
                **shipping_address_data
            )
        else:
            shipping_address = None

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
        setattr(checkout_session, 'payment_secret', payment_secret)
        checkout_session.save()

        # Serialize response properly
        serializer = self.get_serializer(checkout_session)
        response_data = dict(serializer.data)

        # Ensure shipping_address is included in response
        if checkout_session.shipping_address:
            response_data['shipping_address'] = ShippingAddressSerializer(
                checkout_session.shipping_address
            ).data

        return Response(response_data, status=status.HTTP_201_CREATED)

# class StartCheckoutSessionView(generics.CreateAPIView):
#     """
#     API endpoint to start a checkout session.
#     This view handles the creation of a checkout session for a user's cart.
#     It ensures the cart is not empty, creates an order for the cart items,
#     and initiates a payment intent.
#     Attributes:
#         permission_classes (list):
#         List of permission classes;
#         only authenticated users can initiate checkout.
#         serializer_class (Serializer):
#         The serializer used for validating input data.
#     Methods:
#         post(request, *args, **kwargs):
#         Handles POST requests to initiate a checkout session.
#        """
#     permission_classes = [IsAuthenticated]
#     serializer_class = CheckoutSessionSerializer
#
#     def post(self, request, *args, **kwargs):
#         print("Request Data:", request.data)  # Debugging line
#         """
#         Handles the creation of a new checkout session.
#         The method retrieves the user's cart, validates that it is not empty,
#         and then creates a new checkout session. It also creates an order
#         from the cart items and initiates a payment intent.
#
#         Args:
#             request (Request):
#             The request object containing user and checkout data.
#             *args: Variable length argument list.
#             **kwargs: Arbitrary keyword arguments.
#         Returns:
#             Response:
#             JSON response containing the checkout session details
#             or error information.
#         """
#         # Get the user's cart
#         cart = get_or_create_cart(request.user)
#
#         # Validate cart - it shouldn't be empty
#         if not cart.items.exists():
#             return Response(
#                 {'detail': "Cart is empty."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#
#         # Check if a CheckoutSession already exists for this cart
#         if CheckoutSession.objects.filter(cart=cart).exists():
#             return Response(
#                 {'detail': "Checkout session already exists for this cart."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#
#         # Validate request data using the serializer
#         serializer = self.get_serializer(
#             data=request.data,
#             context={'request': request}
#         )
#         # Validate input data before proceeding
#         serializer.is_valid(raise_exception=True)
#
#         # Extract validated data
#         # shipping_address = serializer.validated_data['shipping_address']
#         shipping_address_data = serializer.validated_data.get('shipping_address')
#
#         if shipping_address_data:
#             shipping_address, _ = ShippingAddress.objects.get_or_create(
#                 user=request.user,  # Associate with user
#                 **shipping_address_data  # Unpack dictionary to model fields
#             )
#         else:
#             shipping_address = None
#
#         # Create the checkout session
#         checkout_session = CheckoutSession.objects.create(
#             user=request.user,
#             cart=cart,
#             shipping_address=shipping_address
#         )
#
#         # Prepare items data to pass to create_order function
#         items_data = [
#             {
#                 'product': item.product.uuid,
#                 'quantity': item.quantity
#             }
#             for item in cart.items.all()
#         ]
#
#         # Create an order from the cart
#         order = create_order(user=request.user, items_data=items_data)
#
#         # Create payment intent for checkout & attach it to a payment object
#         payment_secret = create_payment_intent(
#             order_uuid=order.uuid, user=request.user
#         )
#         payment = Payment.objects.get(order=order)
#         checkout_session.payment = payment
#         # Attach 'payment_secret' dynamically to checkout_session instance
#         setattr(checkout_session, 'payment_secret', payment_secret)
#         checkout_session.save()
#
#         serializer = self.get_serializer(checkout_session)
#
#         response_data = dict(serializer.data)
#         # # shipping_address is currently a pk in `serializer.data`:
#         # # Overwrite it with nested if it’s not None:
#         # if checkout_session.shipping_address:
#         #     response_data['shipping_address'] = ShippingAddressSerializer(
#         #         checkout_session.shipping_address
#         #     ).data
#
#         return Response(serializer.data, status=status.HTTP_201_CREATED)


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
    and marking the order as completed, and clears the cart.

    Attributes:
        permission_classes (list): List of permission classes;
        only authenticated users can complete checkout.

    Methods:
        post(request, *args, **kwargs):
        Handles POST requests to complete a checkout session.
    """
    serializer_class = CheckoutSessionSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        checkout_session_uuid = kwargs['checkout_session_uuid']
        with transaction.atomic():
            # 1) Find the checkout session for the current user
            checkout_session = get_object_or_404(
                CheckoutSession.objects.select_for_update(),
                uuid=checkout_session_uuid,
                user=request.user
            )

            # 2) Ensure it's still in progress
            if checkout_session.status != 'IN_PROGRESS':
                raise InvalidCheckoutSessionException()

            # 3) Retrieve the payment intent from Stripe
            payment_intent = stripe.PaymentIntent.retrieve(
                checkout_session.payment.stripe_payment_intent_id
            )

            # 4) If the payment intent didn't succeed, mark as failed
            if payment_intent['status'] != 'succeeded':
                checkout_session.status = 'FAILED'
                checkout_session.payment.status = Payment.FAILED
                checkout_session.save()
                checkout_session.payment.save()

                # Raise an error after the DB transaction completes
                def raise_exception():
                    raise PaymentFailedException()

                transaction.on_commit(raise_exception)
                return Response(
                    {"detail": "Payment could not be processed"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # 5) Payment successful -> update payment/order status
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

            # 6) Clear the entire cart object so user
            # can check out again next time
            cart = checkout_session.cart
            cart.delete()

        return Response(
            {
                "detail": "Checkout completed successfully.",
                "order_id": order.uuid
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
