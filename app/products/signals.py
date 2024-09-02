from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import ProductImage


@receiver(post_delete, sender=ProductImage)
def delete_image_file(sender, instance, **kwargs):
    """
    Delete the image file from the filesystem when a ProductImage instance is deleted.
    """
    if instance.image:
        instance.image.delete(save=False)
