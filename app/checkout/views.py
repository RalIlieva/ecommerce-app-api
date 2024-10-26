from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CheckoutSession
from cart.services import get_or_create_cart
from .serializers import CheckoutSessionSerializer
from order.services import create_order_from_cart


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

        serializer = self.get_serializer(checkout_session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CompleteCheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        checkout_session_uuid = kwargs['checkout_session_uuid']
        try:
            checkout_session = CheckoutSession.objects.get(uuid=checkout_session_uuid, user=request.user)
        except CheckoutSession.DoesNotExist:
            return Response({"detail": "Checkout session not found."}, status=status.HTTP_404_NOT_FOUND)

        if checkout_session.status != 'IN_PROGRESS':
            return Response({"detail": "Checkout session is no longer valid."}, status=status.HTTP_400_BAD_REQUEST)

        # TODO payment system, similar to the Payment app

        # Create an order from the cart after successful payment
        order = create_order_from_cart(checkout_session.cart, request.user)
        if order:
            checkout_session.status = 'COMPLETED'
            checkout_session.save()
            return Response({"detail": "Checkout completed successfully.", "order_id": order.uuid},
                            status=status.HTTP_200_OK)

        return Response({"detail": "Failed to complete checkout."}, status=status.HTTP_400_BAD_REQUEST)
