""""
Custom user model.
"""

from django.conf import settings
from django.db import models
from django.contrib.auth.models import (
    AbstractUser,
    BaseUserManager,
    PermissionsMixin,
)
from core.models import (
    TimeStampedModel,
    UUIDModel
)
from phonenumber_field.modelfields import PhoneNumberField


class UserManager(BaseUserManager):
    """Manager for users."""

    def create_user(self, email, password=None, **extra_fields):
        """Create, return and save a new user."""
        if not email:
            raise ValueError('User must have an email address.')
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password):
        """Create a new superuser."""
        user = self.create_user(email, password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)

        return user


class User(AbstractUser, PermissionsMixin):
    """Custom user in the system."""
    username = None
    email = models.EmailField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


class CustomerProfile(UUIDModel, TimeStampedModel):
    """Customer profile for users that are buyers."""

    GENDER_MALE = "m"
    GENDER_FEMALE = "f"
    OTHER = "o"

    GENDER_CHOICES = (
        (GENDER_MALE, "Male"),
        (GENDER_FEMALE, "Female"),
        (OTHER, "Other"),
    )
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        related_name="customer_profile",
        on_delete=models.CASCADE
    )
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    phone_number = PhoneNumberField(blank=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    about = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.user.email
