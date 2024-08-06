"""
Create customer profile when a user is registered with signals.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import CustomerProfile


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_customer_profile(sender, instance, created, **kwargs):
    if created:
        CustomerProfile.objects.create(user=instance)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_customer_profile(sender, instance, **kwargs):
    instance.customer_profile.save()
