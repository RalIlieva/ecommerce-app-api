"""
Views for the products' reviews API.
"""

from rest_framework import generics, permissions
from rest_framework import serializers
from ..models import Product, Review
from ..serializers import (
    ReviewSerializer
)

