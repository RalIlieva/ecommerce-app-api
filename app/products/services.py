"""
Business logic - functions - write to db.
"""

from django.core.exceptions import ValidationError
from django.utils.text import slugify
from .models import (
    Product,
    # ProductImage,
    Tag,
    Category
)


def get_or_create_category(data):
    """Create or retrieve a category based on input data."""
    if isinstance(data, dict):
        name = data.get('name')
        # Generate slug if not provided
        slug = data.get('slug', slugify(name))

        if not name:
            raise ValidationError({"name": "This field is required."})

        # Check for existing category
        category = Category.objects.filter(name=name, slug=slug).first()
        if category:
            return category

        parent_id = data.get('parent')
        parent = None
        if parent_id:
            try:
                parent = Category.objects.get(pk=parent_id)
            except Category.DoesNotExist:
                raise ValidationError(
                    f"Parent category with id {parent_id} does not exist."
                )

        # Create new category if not found
        category, created = Category.objects.get_or_create(
            name=name, slug=slug, defaults={'parent': parent}
        )
        return category

    raise ValidationError(
        {"category": "Expected a dict with 'name'/optional 'slug' fields."}
    )


def create_product_with_related_data(validated_data):
    """Create a product with its related category and tags."""
    # Extract and process the category data
    category_data = validated_data.pop('category', None)

    if isinstance(category_data, Category):
        category = category_data  # Already a Category instance
    elif isinstance(category_data, dict):
        # Convert category_data to Category instance
        category = get_or_create_category(category_data)
    else:
        raise ValidationError({"category": "Invalid category data."})

    validated_data['category'] = category

    # Extract tags data, but do not include it in validated_data yet
    tags_data = validated_data.pop('tags', [])

    # Create the product with the validated category
    product = Product.objects.create(**validated_data)
    for tag_data in tags_data:
        tag, created = Tag.objects.get_or_create(**tag_data)
        product.tags.add(tag)

    return product


def update_product_with_related_data(instance, validated_data):
    # Handle category update
    category_data = validated_data.pop('category', None)

    if category_data:
        if isinstance(category_data, dict):
            # Process category data correctly
            category, created = Category.objects.get_or_create(
                name=category_data['name'],
                slug=category_data.get(
                    'slug', slugify(category_data['name'])
                ),
                defaults={'parent': category_data.get('parent')}
            )
        elif isinstance(category_data, Category):
            category = category_data  # It's already a Category instance

        instance.category = category

    # Handle tags update
    tags_data = validated_data.pop('tags', None)
    if tags_data is not None:
        print("Updating tags...")  # Debug output
        instance.tags.clear()
        for tag_data in tags_data:
            print(f"Processing tag: {tag_data}")  # Debug output
            tag, created = Tag.objects.get_or_create(**tag_data)
            instance.tags.add(tag)

    # Set the remaining fields
    for attr, value in validated_data.items():
        setattr(instance, attr, value)

    instance.save()  # Ensure the instance is saved with the updated fields
    return instance


# def update_product_stock(product_id, quantity):
#     product = Product.objects.get(id=product_id)
#     product.stock -= quantity
#     product.save()
#     return product
