"""
Register product models with custom admin config.
"""


from django.contrib import admin
from .models import Product, Category, Tag, ProductImage, Review

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'stock', 'is_active']
    list_filter = ['is_active', 'category', 'tags']


admin.site.register(Category)
admin.site.register(Tag)
admin.site.register(ProductImage)
admin.site.register(Review)
