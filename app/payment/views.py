from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import stripe
from django.conf import settings
from .services import create_payment_intent, update_payment_status
from .models import Payment

stripe.api_key = settings.STRIPE_SECRET_KEY


class CreatePaymentView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        order_id = request.data.get('order_id')
        try:
            client_secret = create_payment_intent(order_id, request.user)
            return Response({'client_secret': client_secret}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=400)
    except stripe.error.SignatureVerificationError as e:
        return JsonResponse({'error': str(e)}, status=400)

    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        update_payment_status(payment_intent['id'], Payment.SUCCESS)

    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        update_payment_status(payment_intent['id'], Payment.FAILED)

    return JsonResponse({'status': 'success'}, status=200)
