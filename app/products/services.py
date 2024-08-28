# """
# Business logic - functions - write to db.
# """
#
# from .models import Product, ProductImage, Tag, Category
#
#
# # First attempt
# def create_product_with_related_data(validated_data):
#     print("Validated Data Received:", validated_data)
#
#     images_data = validated_data.pop('images', [])
#     tags_data = validated_data.pop('tags', [])
#     category_data = validated_data.pop('category', None)
#
#     print("Category Data:", category_data)
#
#     if isinstance(category_data, Category):
#         # If category_data is already a Category instance, use it directly
#         category = category_data
#     elif category_data is not None:
#         # Handle category creation/retrieval if category_data is a dict
#         category_slug = category_data.get('slug')
#         if category_slug:
#             # Retrieve the existing category by slug or create a new one
#             category, created = Category.objects.get_or_create(
#                 slug=category_slug,
#                 defaults=category_data
#             )
#         else:
#             # If no slug is provided, create a new category
#             category = Category.objects.create(**category_data)
#     else:
#         raise ValueError("Category data is required")
#
#     validated_data['category'] = category
#
#     # Handle category creation or retrieval
#     # if category_data is not None:
#     #     category_slug = category_data.get('slug')
#     #     category_name = category_data.get('name')
#     #
#     #     print("Category Slug:", category_slug)
#     #     print("Category Name:", category_name)
#     #
#     #     # Attempt to retrieve the existing category by slug
#     #     category = Category.objects.filter(slug=category_slug).first()
#     #     print("Retrieved Category:", category)
#     #     if not category:
#     #         # If the category does not exist, create it
#     #         category = Category.objects.create(
#     slug=category_slug,
#     name=category_name
#     )
#     #         print("Created New Category:", category)
#     #
#     #     validated_data['category'] = category
#     # else:
#     #     raise ValueError("Category data is required")
#
#     # Create the product with the associated category
#     product = Product.objects.create(**validated_data)
#
#     print("Validated Data After Category Handling:", validated_data)
#
#     # # Handle category creation or retrieval
#     # if category_data is not None:
#     #     category_slug = category_data.get('slug')
#     #     if category_slug:
#     #         # Retrieve the existing category or create
#     #         category, created = Category.objects.get_or_create(
#     #             slug=category_slug,
#     #             defaults=category_data
#     #         )
#     #     else:
#     #         # If no slug is provided, create a new category
#     #         category = Category.objects.create(**category_data)
#     #     validated_data['category'] = category
#     # else:
#     #     raise ValueError("Category data is required")
#
#     # # Create the product with the associated category
#     # product = Product.objects.create(**validated_data)
#
#     # # Handle category creation or retrieval
#     # if category_data:
#     #     category_slug = category_data.get('slug')
#     #     category = Category.objects.filter(slug=category_slug).first()
#     #     if not category:
#     #         # If the category does not exist, create a new one
#     #         category = Category.objects.create(**category_data)
#     #     validated_data['category'] = category
#     # else:
#     #     raise ValueError("Category data is required")
#
#     # # Create the product with the associated category
#     # product = Product.objects.create(**validated_data)
#
#     for image_data in images_data:
#         ProductImage.objects.create(product=product, **image_data)
#
#     for tag_data in tags_data:
#         tag, created = Tag.objects.get_or_create(**tag_data)
#         product.tags.add(tag)
#
#     return product
#
#
# def update_product_with_related_data(instance, validated_data):
#     images_data = validated_data.pop('images', [])
#     tags_data = validated_data.pop('tags', [])
#     category_data = validated_data.pop('category', None)
#
#     # Update product instance
#     instance.name = validated_data.get('name', instance.name)
#     instance.description = validated_data.get(
#         'description',
#         instance.description
#     )
#     instance.price = validated_data.get('price', instance.price)
#     instance.category = validated_data.get('category', instance.category)
#     instance.stock = validated_data.get('stock', instance.stock)
#
#     # Handle category update or retrieval
#     if category_data:
#         category_slug = category_data.get('slug')
#         if category_slug:
#             category, created = Category.objects.get_or_create(
#                 slug=category_slug,
#                 defaults=category_data
#             )
#             instance.category = category
#         else:
#             # Create a new category if no slug is provided
#             category = Category.objects.create(**category_data)
#             instance.category = category
#
#     instance.save()
#
#     # Handle nested images
#     instance.images.all().delete()
#     for image_data in images_data:
#         ProductImage.objects.create(product=instance, **image_data)
#
#     # Handle nested tags
#     instance.tags.clear()
#     for tag_data in tags_data:
#         tag, created = Tag.objects.get_or_create(**tag_data)
#         instance.tags.add(tag)
#
#     return instance
#
#
# def update_product_stock(product_id, quantity):
#     product = Product.objects.get(id=product_id)
#     product.stock -= quantity
#     product.save()
#     return product
