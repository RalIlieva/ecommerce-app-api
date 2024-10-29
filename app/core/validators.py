from rest_framework import serializers


def validate_string_only(value):
    print(f"Validating that value is a string: {value} ({type(value)})")
    if not isinstance(value, str):
        raise serializers.ValidationError("Not a valid string.")
        # Additional check to reject purely numeric strings
    if value.isdigit():
        raise serializers.ValidationError("Shipping address cannot be purely numeric.")
