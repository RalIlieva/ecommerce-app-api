"""
Create customer profile when a user is registered with signals.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import CustomerProfile


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_or_update_customer_profile(sender, instance, created, **kwargs):
    if created:
        # Create CustomerProfile if User is newly created
        CustomerProfile.objects.create(user=instance)
    else:
        # Ensure CustomerProfile exists and save it
        profile, _ = CustomerProfile.objects.get_or_create(user=instance)
        profile.save()
