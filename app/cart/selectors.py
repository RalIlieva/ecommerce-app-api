from .models import Cart


def get_user_cart(user):
    return Cart.objects.prefetch_related('items__product').get(user=user)


def get_cart_total(user):
    cart = get_user_cart(user)
    total = sum(item.product.price * item.quantity for item in cart.items.all())
    return total


# from .models import Cart
#
#
# def get_cart(user):
#     return Cart.objects.get(user=user)
#
#
# def calculate_cart_total(cart):
#     return sum(
#     item.product.price * item.quantity for item in cart.items.all()
#     )
