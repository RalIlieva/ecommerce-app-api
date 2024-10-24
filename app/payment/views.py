from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, Http404
from django_filters.rest_framework import DjangoFilterBackend
import stripe
from django.conf import settings
from .services import create_payment_intent, update_payment_status
from .models import Payment
from .serializers import PaymentSerializer
from .selectors import get_payment_by_uuid, get_user_payments
from .filters import PaymentFilter

stripe.api_key = settings.STRIPE_SECRET_KEY


class CreatePaymentView(generics.GenericAPIView):
    """
    API view to create a payment intent with Stripe.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        order_id = request.data.get('order_id')
        try:
            # Create a payment intent for the given order
            client_secret = create_payment_intent(order_id, request.user)
            return Response(
                {'client_secret': client_secret}, status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, status=status.HTTP_400_BAD_REQUEST
            )


class PaymentDetailView(generics.RetrieveAPIView):
    """
    API view to retrieve payment details.
    """
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'  # Use UUID for detail view

    def get_object(self):
        # Use selector to retrieve a specific payment by uuid for the user
        payment = get_payment_by_uuid(self.request.user, self.kwargs['uuid'])
        if payment is None:
            raise Http404("Payment not found.")
        return payment


class PaymentListView(generics.ListAPIView):
    """
    API view to list all payments for the authenticated user.
    """
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = PaymentFilter  # Use the PaymentFilter for filtering

    def get_queryset(self):
        # Get payments only for the authenticated user
        return get_user_payments(self.request.user)


@csrf_exempt
def stripe_webhook(request):
    """
    Webhook to handle Stripe payment events.
    """
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=400)
    except stripe.error.SignatureVerificationError as e:
        return JsonResponse({'error': str(e)}, status=400)

    # Handle different Stripe webhook events
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        update_payment_status(payment_intent['id'], Payment.SUCCESS)

    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        update_payment_status(payment_intent['id'], Payment.FAILED)

    return JsonResponse({'status': 'success'}, status=200)
