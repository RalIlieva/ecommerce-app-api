"""
Business logic - functions - write to db.
"""

from .models import Product


def create_product(name, description, price, category, stock):
    """Create a new product."""
    product = Product.objects.create(
        name=name,
        description=description,
        price=price,
        category=category,
        stock=stock
    )
    return product


def update_product(product, **kwargs):
    """Update an existing product."""
    for attr, value in kwargs.items():
        setattr(product, attr, value)
    product.save()
    return product


def update_product_stock(product_id, quantity):
    product = Product.objects.get(id=product_id)
    product.stock -= quantity
    product.save()
    return product
