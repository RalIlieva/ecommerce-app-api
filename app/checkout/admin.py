""""
Register checkout models.
"""

from django.contrib import admin
from .models import CheckoutSession

# admin.site.register(CheckoutSession)


@admin.register(CheckoutSession)
class CheckoutSessionAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'user',
        'status',
        'shipping_address',
        'created', 'modified'
    )
    list_filter = ('status', 'created', 'modified')
    search_fields = ('user__email', 'status', 'shipping_address')
