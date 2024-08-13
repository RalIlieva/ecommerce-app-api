"""
Business logic - functions - write to db.
"""

from .models import Product, ProductImage, Tag, Category


def create_product_with_related_data(validated_data):
    images_data = validated_data.pop('images', [])
    tags_data = validated_data.pop('tags', [])
    category_data = validated_data.pop('category', None)

    # Handle category
    if category_data:
        if isinstance(category_data, dict):
            # If category data is provided as a dict, create or get the category
            category, created = Category.objects.get_or_create(**category_data)
        else:
            # Otherwise, use the provided category instance
            category = category_data
    else:
        category = None

    product = Product.objects.create(**validated_data)

    for image_data in images_data:
        ProductImage.objects.create(product=product, **image_data)

    for tag_data in tags_data:
        tag, created = Tag.objects.get_or_create(**tag_data)
        product.tags.add(tag)

    return product


def update_product_with_related_data(instance, validated_data):
    images_data = validated_data.pop('images', [])
    tags_data = validated_data.pop('tags', [])
    category_data = validated_data.pop('category', None)

    # Update product instance
    instance.name = validated_data.get('name', instance.name)
    instance.description = validated_data.get('description', instance.description)
    instance.price = validated_data.get('price', instance.price)
    instance.category = validated_data.get('category', instance.category)
    instance.stock = validated_data.get('stock', instance.stock)
    instance.save()

    # Handle category
    if category_data:
        if isinstance(category_data, dict):
            category, created = Category.objects.get_or_create(**category_data)
            instance.category = category
        else:
            instance.category = category_data

    # Handle nested images
    instance.images.all().delete()
    for image_data in images_data:
        ProductImage.objects.create(product=instance, **image_data)

    # Handle nested tags
    instance.tags.clear()
    for tag_data in tags_data:
        tag, created = Tag.objects.get_or_create(**tag_data)
        instance.tags.add(tag)

    return instance


def update_product_stock(product_id, quantity):
    product = Product.objects.get(id=product_id)
    product.stock -= quantity
    product.save()
    return product
