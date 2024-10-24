""""
Register payment models.
"""

from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'order', 'user', 'amount', 'status',
        'stripe_payment_intent_id', 'created', 'modified'
    ]
    list_filter = [
        'status', 'created', 'modified'
    ]
    search_fields = [
        'order__id', 'user__email', 'stripe_payment_intent_id'
    ]
