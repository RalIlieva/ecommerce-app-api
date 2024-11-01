"""
Register wishlist models.
"""

from django.contrib import admin
from .models import Wishlist, WishlistItem

# admin.site.register(Wishlist)


class WishlistItemInline(admin.TabularInline):
    model = WishlistItem
    extra = 0  # Remove empty fields for new WishlistItems in the admin panel


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'uuid', 'user_email', 'created', 'modified'
    ]
    list_filter = [
        'created', 'modified'
    ]
    search_fields = ['user__email', 'id']
    ordering = ['created']
    inlines = [WishlistItemInline]

    def user_email(self, obj):
        return obj.user.email

    user_email.short_description = 'User Email'
