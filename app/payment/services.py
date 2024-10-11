# from .models import Payment
#
#
# def process_payment(order, transaction_id):
#     payment = Payment.objects.create(order=order, transaction_id=transaction_id)
#     payment.status = Payment.COMPLETED
#     payment.save()
#     order.status = 'paid'
#     order.save()
#     return payment
#
#
# def refund_payment(payment):
#     # Implement refund logic with third-party integration here
#     payment.status = Payment.FAILED
#     payment.save()
#     return payment
