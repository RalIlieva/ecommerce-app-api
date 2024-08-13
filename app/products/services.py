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
        category_slug = category_data.get('slug')
        if category_slug:
            # Try to retrieve the existing category by slug
            category = Category.objects.filter(slug=category_slug).first()
            if not category:
                # If category doesn't exist, create a new one
                category = Category.objects.create(**category_data)
        else:
            # If no slug is provided, create a new category
            category = Category.objects.create(**category_data)
    else:
        raise ValueError("Category data is required")

    product = Product.objects.create(category=category, **validated_data)

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
