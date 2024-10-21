""""
Register order models.
"""


from django.contrib import admin
from .models import Order, OrderItem

# admin.site.register(Order)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'uuid', 'user_email', 'status', 'created', 'modified'
    ]
    list_filter = [
        'status', 'created', 'modified'
    ]
    search_fields = ['user__email', 'id']
    ordering = ['created']
    inlines = []

    def user_email(self, obj):
        return obj.user.email

    user_email.short_description = 'User Email'


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0  # Remove empty fields for new OrderItems in the admin panel


# Adding the inline items to the OrderAdmin
OrderAdmin.inlines = [OrderItemInline]
