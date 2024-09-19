"""
Register product models with custom admin config.
"""


from django.contrib import admin
from .models import Product, Category, Tag, ProductImage, Review


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'stock', 'is_active']
    list_filter = ['is_active', 'category', 'tags']


# admin.site.register(Category)
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'slug']
    list_filter = ['created', 'products']


# admin.site.register(Tag)
@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    list_filter = ['products']


admin.site.register(ProductImage)
# @admin.register(ProductImage)
# class ProductImageAdmin(admin.ModelAdmin):
#     list_display = ['alt_text', 'products']


# admin.site.register(Review)
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating']
    list_filter = ['rating', 'user', 'product']
