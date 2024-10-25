from django.contrib import admin
from .models import Cart, CartItem


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'created', 'modified')
    search_fields = ('user__email',)
    readonly_fields = ('uuid', 'created', 'modified')


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'product', 'quantity', 'created', 'modified')
    search_fields = ('cart__user__email', 'product__name')
    readonly_fields = ('uuid', 'created', 'modified')
