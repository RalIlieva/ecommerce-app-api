"""
Business logic - fetching from db.
"""

from .models import Product


# TO DECIDE - keep or use in filters
def get_product_by_id(product_id):
    """Retrieve a product by its ID."""
    return Product.objects.filter(id=product_id).first()


def search_products_by_name(query):
    """Search for products by name."""
    return Product.objects.filter(name__icontains=query)


def get_active_products():
    """Retrieve active products."""
    return Product.objects.filter(is_active=True)
